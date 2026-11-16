'use client';

import React from 'react';
import { MerchantProfile } from '@/features/merchant/types';
import { CheckCircle2, ShieldCheck, Clock, RefreshCcw, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SellerCredibilityPanelProps {
  merchant: MerchantProfile;
}

export function SellerCredibilityPanel({ merchant }: SellerCredibilityPanelProps) {
  // Chart calculation
  const maxOrderCount = Math.max(...(merchant.monthlyOrderCounts?.map(c => c.count) || [1]));

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-success-main" />
        <h3 className="font-semibold text-text">Seller Credibility</h3>
      </div>
      
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col">
          <span className="text-xs text-text-muted">Joined</span>
          <span className="font-medium">{new Date(merchant.joinedDate).getFullYear()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-muted">Orders</span>
          <span className="font-medium">{merchant.ordersCount}+</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-muted">Rating</span>
          <span className="font-medium flex items-center gap-1">
            {merchant.rating} <Award className="w-3 h-3 text-warning-main fill-warning-main" />
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-muted">Status</span>
          <div className="mt-0.5">
            {merchant.isVerified ? (
              <Badge variant="outline" className="text-success-main border-success-main bg-success-50">Verified</Badge>
            ) : merchant.isProvisional ? (
              <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50 font-semibold">
                Provisional (60d)
              </Badge>
            ) : (
              <Badge variant="outline">Unverified</Badge>
            )}
          </div>
        </div>
      </div> */}

      {/* Certifications Section */}
      {merchant.certifications && merchant.certifications.length > 0 && (
        <div className="border-t border-border pt-3.5 mb-3">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
            Verified Certifications
          </span>
          <div className="flex flex-wrap gap-2">
            {merchant.certifications.map((cert, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-800"
              >
                <Award className="w-3.5 h-3.5 text-brand-600" />
                <span>{cert.type}: {cert.number}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 text-sm border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-muted">
            <CheckCircle2 className="w-4 h-4" /> On-time Dispatch
          </div>
          <span className="font-medium">{merchant.onTimeDispatch}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-muted">
            <RefreshCcw className="w-4 h-4" /> Return Rate
          </div>
          <span className="font-medium">{merchant.returnRate}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-muted">
            <Clock className="w-4 h-4" /> Avg Response
          </div>
          <span className="font-medium">{merchant.avgResponseTime}</span>
        </div>
      </div>

      {/* {merchant.monthlyOrderCounts && merchant.monthlyOrderCounts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <span className="text-xs text-text-muted block mb-3">Sales History (Last 4 Months)</span>
          <div className="flex items-end gap-2 h-16">
            {merchant.monthlyOrderCounts.map((monthData, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full">
                <div className="w-full h-full bg-brand-100 rounded-t-sm relative group">
                  <div 
                    className="absolute bottom-0 w-full bg-brand-500 rounded-t-sm transition-all duration-300"
                    style={{ height: `${(monthData.count / maxOrderCount) * 100}%` }}
                  />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    {monthData.count} orders
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
                <span className="text-[10px] text-text-muted uppercase font-medium">{monthData.month}</span>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}
