import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ValuesSection from '../components/landing/ValuesSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import Footer from '../components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ValuesSection />
      <BenefitsSection />
      <Footer />
    </div>
  );
}
