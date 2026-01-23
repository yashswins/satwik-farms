import OurStory from '@/components/about/OurStory';
import MissionVision from '@/components/about/MissionVision';

export const metadata = {
  title: 'About Us - Satwik Farms',
  description: 'Learn about Satwik Farms - organic farming in Kisarawe, Tanzania. Our mission, vision, and commitment to quality.',
};

export default function AboutPage() {
  return (
    <div className="pt-20">
      <OurStory />
      <MissionVision />
    </div>
  );
}
