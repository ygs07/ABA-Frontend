'use client';

import React, { useState, useRef, useEffect } from 'react';
import { NetworkNodeData } from '../types';
import { AmountText } from '@/components/patterns/AmountText';
import { Button } from '@/components/ui/button';
import { brand } from '@/config/brand';
import { Maximize, ZoomIn, ZoomOut, List } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface NetworkTreeProps {
  data: NetworkNodeData;
  anonymize?: boolean;
}

const TreeNode = ({
  node,
  anonymize,
  onSelect,
  isSelected
}: {
  node: NetworkNodeData;
  anonymize: boolean;
  onSelect: (n: NetworkNodeData) => void;
  isSelected: boolean;
}) => {
  const [expanded, setExpanded] = useState(true);

  const displayName = anonymize ? (node.alias || `User ${node.code.slice(-4)}`) : node.name;
  
  // Size based on percentile if available, otherwise fixed
  const sizeClass = (node.performancePercentile ?? 0) > 80 ? 'w-16 h-16 text-xl' : 
                    (node.performancePercentile ?? 0) > 50 ? 'w-12 h-12 text-lg' : 'w-10 h-10 text-md';
  const colorClass = (node.performancePercentile ?? 0) > 80 ? 'bg-brand-100 border-brand-500' : 
                     (node.performancePercentile ?? 0) > 50 ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-300';

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative flex items-center justify-center rounded-full border-2 cursor-pointer shadow-sm transition-transform hover:scale-110 ${sizeClass} ${colorClass} ${isSelected ? 'ring-4 ring-brand-300' : ''}`}
        onClick={() => onSelect(node)}
      >
        <span className="font-bold text-gray-700">{displayName.charAt(0)}</span>
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${node.active ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      <div className="mt-1 text-xs font-medium text-center truncate w-24">
        {displayName}
      </div>

      {node.children && node.children.length > 0 && (
        <div className="mt-2 flex flex-col items-center">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full border hover:bg-gray-200 z-10 relative"
          >
            {expanded ? '-' : '+'} {node.children.length}
          </button>
          
          {expanded && (
            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-300 relative">
              {/* Connecting vertical line from parent to horizontal line */}
              <div className="absolute top-0 left-1/2 w-px h-4 bg-gray-300 -translate-x-1/2 -mt-4"></div>
              
              {node.children.map((child, idx) => (
                <div key={child.id} className="relative pt-4">
                  {/* Connecting vertical line to child */}
                  <div className="absolute top-0 left-1/2 w-px h-4 bg-gray-300 -translate-x-1/2"></div>
                  <TreeNode 
                    node={child} 
                    anonymize={anonymize} 
                    onSelect={onSelect} 
                    isSelected={isSelected} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function NetworkTree({ data, anonymize = false }: NetworkTreeProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<NetworkNodeData | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
  const handleFit = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Fallback flat list generation
  const flattenNodes = (node: NetworkNodeData): NetworkNodeData[] => {
    return [node, ...(node.children || []).flatMap(flattenNodes)];
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-gray-50 border-dashed">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
          <span className="text-2xl">🌱</span>
        </div>
        <h3 className="text-lg font-bold">No Network Yet</h3>
        <p className="text-gray-500 mb-4 max-w-sm">You haven't referred anyone to your network yet. Start sharing your link to grow your team!</p>
        <Button>Share your link</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[600px]">
      {/* Main visualization area */}
      <div className="flex-1 border border-border rounded-xl bg-white overflow-hidden flex flex-col relative">
        <div className="p-2 border-b bg-gray-50 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode(v => v === 'tree' ? 'list' : 'tree')}>
              <List className="w-4 h-4 mr-2" />
              {viewMode === 'tree' ? 'List View' : 'Tree View'}
            </Button>
          </div>
          {viewMode === 'tree' && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleZoomOut}><ZoomOut className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={handleFit}><Maximize className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={handleZoomIn}><ZoomIn className="w-4 h-4" /></Button>
            </div>
          )}
        </div>

        {viewMode === 'tree' ? (
          <div 
            ref={containerRef}
            className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing bg-slate-50 relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div 
              className="absolute top-1/2 left-1/2 origin-center transition-transform duration-75"
              style={{ transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})` }}
            >
              <TreeNode 
                node={data} 
                anonymize={anonymize} 
                onSelect={setSelectedNode}
                isSelected={selectedNode?.id === data.id}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2 rounded-tl-lg">Member</th>
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">Sales (Team)</th>
                  <th className="px-4 py-2 rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {flattenNodes(data).map(node => (
                  <tr key={node.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedNode(node)}>
                    <td className="px-4 py-3 font-medium">
                      {anonymize ? (node.alias || `User ${node.code.slice(-4)}`) : node.name}
                    </td>
                    <td className="px-4 py-3">{node.level}</td>
                    <td className="px-4 py-3"><AmountText amountInKobo={node.sales} /></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${node.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {node.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        {viewMode === 'tree' && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur border p-3 rounded-lg shadow-sm text-xs space-y-2 pointer-events-none">
            <div className="font-bold mb-1">Performance (Percentile)</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-brand-100 border-2 border-brand-500"></div> Top 20%</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-50 border-2 border-blue-400"></div> Average</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-50 border-2 border-gray-300"></div> Needs Work</div>
          </div>
        )}
      </div>

      {/* Side Card */}
      {selectedNode && (
        <div className="w-full md:w-80 border border-border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col shrink-0">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">
                {anonymize ? (selectedNode.alias || `User ${selectedNode.code.slice(-4)}`) : selectedNode.name}
              </h3>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Level {selectedNode.level}</p>
            </div>
            <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-700">&times;</button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs text-gray-500">Joined Date</div>
              <div className="font-medium">
                {selectedNode.joinedDate ? format(new Date(selectedNode.joinedDate), 'MMM d, yyyy') : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Active Status</div>
              <div className={`font-medium ${selectedNode.active ? 'text-green-600' : 'text-red-600'}`}>
                {selectedNode.active ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-500">Personal Sales</div>
              <div className="font-bold text-lg"><AmountText amountInKobo={selectedNode.personalSales || 0} /></div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Team Sales (Network)</div>
              <div className="font-bold text-lg"><AmountText amountInKobo={selectedNode.sales || 0} /></div>
            </div>
            {selectedNode.performancePercentile !== undefined && (
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">Performance</div>
                <div className="font-medium text-brand-600">Top {100 - selectedNode.performancePercentile}% of peers</div>
              </div>
            )}
            <Link href={`/erp/referrals/network/${encodeURIComponent(selectedNode.id)}`}>
              <Button className="w-full" variant="outline" size="sm">Use as network root</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
