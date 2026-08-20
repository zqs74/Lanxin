import HeroSection from './showcase/sections/HeroSection';
import ArcGallery from './showcase/sections/ArcGallery';
import BusinessSection from './showcase/sections/BusinessSection';
import TechSection from './showcase/sections/TechSection';
import CaseGallery from './showcase/sections/CaseGallery';
import RecognitionSection from './showcase/sections/RecognitionSection';
import SmartMatchEntry from './showcase/sections/SmartMatchEntry';
import PartnerSection from './showcase/sections/PartnerSection';
import Footer from '../components/Footer';
import { useEffect } from 'react';

export default function ShowcaseHomePage() {
  useEffect(() => {
    // Scroll-triggered fade-in animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-fade-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="page-showcase relative w-full overflow-hidden min-h-screen" style={{ background: 'var(--page-bg)' }}>
      <HeroSection />
      <ArcGallery />
      <BusinessSection />
      <TechSection />
      <CaseGallery />
      <RecognitionSection />
      <SmartMatchEntry />
      <PartnerSection />
      <Footer variant="full" />
    </div>
  );
}
