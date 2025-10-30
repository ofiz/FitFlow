// src/components/tabs/PracticalContentTab.jsx
import React from 'react';
import { ExternalLink } from 'lucide-react';
import '../../styles/tabs/PracticalContentTab.css';

// Import logos from src/assets/logos
// If you don't have the images yet, this will show an error until you add them
import iherbLogo from '../../assets/logos/iherb-logo.png';
import myproteinLogo from '../../assets/logos/myprotein-logo.png';
import israelbodyLogo from '../../assets/logos/israelbody-logo.png';
import muscleandstrengthLogo from '../../assets/logos/muscleandstrength-logo.png';
import onebodyLogo from '../../assets/logos/onebody-logo.png';
import healthlineLogo from '../../assets/logos/healthline-logo.png';
import myfitnesspalLogo from '../../assets/logos/myfitnesspal-logo.png';

const PracticalContentTab = () => {
  const supplementStores = [
    {
      name: 'iHerb',
      description: 'Global supplements and health products marketplace',
      url: 'https://www.iherb.com',
      logo: iherbLogo,
      gradient: 'gradient-green-emerald'
    },
    {
      name: 'MyProtein',
      description: 'Sports nutrition and protein supplements',
      url: 'https://www.myprotein.co.il',
      logo: myproteinLogo,
      gradient: 'gradient-blue-cyan'
    },
    {
      name: 'IsraelBody',
      description: 'Israeli fitness supplements store',
      url: 'https://www.israelbody.com',
      logo: israelbodyLogo,
      gradient: 'gradient-purple-pink'
    }
  ];

  const workoutPrograms = [
    {
      name: 'Muscle & Strength',
      description: 'Free workout routines and programs',
      url: 'https://www.muscleandstrength.com/workout-routines',
      logo: muscleandstrengthLogo,
      gradient: 'gradient-orange-red'
    },
    {
      name: 'OneBody',
      description: 'Training plans and workout guides (Hebrew)',
      url: 'https://www.onebody.co.il/category/training/plan/',
      logo: onebodyLogo,
      gradient: 'gradient-purple-pink'
    }
  ];

  const contentResources = [
    {
      name: 'Healthline',
      description: 'Health, nutrition, and fitness articles',
      url: 'https://www.healthline.com',
      logo: healthlineLogo,
      gradient: 'gradient-green-emerald'
    },
    {
      name: 'MyFitnessPal Blog',
      description: 'Nutrition tips and fitness content',
      url: 'https://blog.myfitnesspal.com',
      logo: myfitnesspalLogo,
      gradient: 'gradient-blue-cyan'
    }
  ];

  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const ExternalLinkCard = ({ name, description, url, logo, gradient }) => (
    <div className="external-link-card" onClick={() => handleLinkClick(url)}>
      <div className={`link-logo-container ${gradient}`}>
        <img 
          src={logo} 
          alt={`${name} logo`} 
          className="link-logo"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div class="link-logo-placeholder">${name.charAt(0)}</div>`;
          }}
        />
      </div>
      <div className="link-content">
        <h3 className="link-title">{name}</h3>
        <p className="link-description">{description}</p>
        <div className="link-action">
          <span>Visit Website</span>
          <ExternalLink size={16} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="practical-content-tab">
      <div className="tab-header">
        <h1 className="tab-title">
          Practical <span className="gradient-purple-pink">Content</span>
        </h1>
        <p className="tab-subtitle">
          Curated external resources for fitness and nutrition
        </p>
      </div>

      {/* Section 1: Supplement Stores */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="gradient-green-emerald">Supplement Stores</span>
          </h2>
          <p className="section-description">
            Purchase fitness and nutrition products
          </p>
        </div>
        <div className="links-grid">
          {supplementStores.map((store, index) => (
            <ExternalLinkCard key={index} {...store} />
          ))}
        </div>
      </section>

      {/* Section 2: Workout Programs */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="gradient-orange-red">Free Workout Programs</span>
          </h2>
          <p className="section-description">
            Access professional training plans and routines
          </p>
        </div>
        <div className="links-grid">
          {workoutPrograms.map((program, index) => (
            <ExternalLinkCard key={index} {...program} />
          ))}
        </div>
      </section>

      {/* Section 3: Content & Blogs */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="gradient-blue-cyan">Content & Blogs</span>
          </h2>
          <p className="section-description">
            Articles, guides, and educational content
          </p>
        </div>
        <div className="links-grid">
          {contentResources.map((resource, index) => (
            <ExternalLinkCard key={index} {...resource} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default PracticalContentTab;