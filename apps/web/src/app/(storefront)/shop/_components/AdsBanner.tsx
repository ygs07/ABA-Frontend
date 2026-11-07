'use client';
import { brand } from '@/config/brand';
import React from 'react';
import { BannerCarousel } from '@/components/patterns/BannerCarousel';

export function AdsBanner() {
  const banners = [
    { id: 1, src: '/banners/Buy Naija Banner - 1.png', alt: brand.tagline },
    { id: 2, src: '/banners/Buy Naija Banner - 2.png', alt: `Shop Local, Grow Together` },
    { id: 3, src: '/banners/Buy Naija Banner - 3.png', alt: `Shop Local, Support Nigeria` },
    { id: 4, src: '/banners/Buy Naija Banner - 4.png', alt: `Shop Local, Support Nigeria` },
    { id: 5, src: '/banners/Buy Naija Banner - 5.png', alt: `Shop Local, Support Nigeria` },
    { id: 6, src: '/banners/Buy Naija Banner - 6.png', alt: `Shop Local, Support Nigeria` },
  ];

  return (
    <div className="pb-8">
      <BannerCarousel banners={banners} />
    </div>
  );
}

// import React from 'react';
// import { Button } from '@/components/ui/button';

// export function AdsBanner() {
//   return (
//     <div className="bg-[#f8f8f8] rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
//       <div className="max-w-md space-y-4">
//         <h2 className="text-3xl md:text-5xl font-bold text-[#111]">Upgrade your ride</h2>
//         <p className="text-[#333] text-lg">Get free shipping on car parts and accessories for every journey.</p>
//         <Button className="bg-[#111] text-white rounded-full px-8 py-6 text-base font-bold hover:bg-black mt-2">Shop now</Button>
//       </div>
//       <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto snap-x">
//          <div className="flex flex-col gap-2 shrink-0 snap-center">
//             <div className="bg-[#e41e31] text-white font-bold px-4 py-1.5 rounded-full self-start text-sm">Free shipping</div>
//             <div className="w-40 h-40 md:w-48 md:h-48 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center p-2">
//                 <img src="https://images.unsplash.com/photo-1549317336-206569e8475c?q=80&w=200&auto=format&fit=crop" alt="Dashcam" className="object-contain w-full h-full mix-blend-multiply" />
//             </div>
//          </div>
//          <div className="w-40 h-48 md:w-48 md:h-56 rounded-xl overflow-hidden shadow-sm shrink-0 mt-10 snap-center">
//             <img src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=200&auto=format&fit=crop" alt="Cleaning" className="object-cover w-full h-full" />
//          </div>
//          <div className="w-40 h-48 md:w-48 md:h-56 bg-[#ff4d4f] rounded-xl shadow-sm flex items-center justify-center shrink-0 mt-10 p-4 snap-center">
//             <img src="https://images.unsplash.com/photo-1559950787-8df76cb5e20a?q=80&w=200&auto=format&fit=crop" alt="Wipers" className="object-cover w-full h-full mix-blend-multiply opacity-80" />
//          </div>
//       </div>
//     </div>
//   );
// }
