import React from 'react';
import { Hero } from '../components/Hero/Hero';
import { ThisWeekEvents } from '../components/ThisWeekEvents/ThisWeekEvents';
import { FeaturedEvents } from '../components/FeaturedEvents/FeaturedEvents';
import { Categories } from '../components/Categories/Categories';
import { HowFestoraWorks } from '../components/HowFestoraWorks/HowFestoraWorks';
import { HyderabadSection } from '../components/HyderabadSection/HyderabadSection';
import { Colleges } from '../components/Colleges/Colleges';
import { UpcomingEvents } from '../components/UpcomingEvents/UpcomingEvents';
import { WhyFestora } from '../components/WhyFestora/WhyFestora';

export const HomePage = () => {
  return (
    <div className="home-page-view">
      {/* 1. Hero with Physical Poster Collage Composition */}
      <Hero />

      {/* 2. Compact Event Discovery Strip: This Week in Hyderabad */}
      <ThisWeekEvents />

      {/* 3. Featured Campus Experiences — Editorial Poster Layout */}
      <FeaturedEvents />

      {/* 4. Event Categories — Icon Navigation */}
      <Categories />

      {/* 5. How Festora Works — Progressive Timeline Journey */}
      <HowFestoraWorks />

      {/* 6. Hyderabad Location Identity Section */}
      <HyderabadSection />

      {/* 7. Top Hyderabad Universities Strip */}
      <Colleges />

      {/* 8. Structured Upcoming Fest Matrix */}
      <UpcomingEvents />

      {/* 9. Mission & Campus Community Voices */}
      <WhyFestora />
    </div>
  );
};

export default HomePage;


