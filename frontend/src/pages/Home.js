import "./Home.css";

import Navbar from "../components/Navbar/Navbar";
import AnimatedBackground from "../components/AnimatedBackground/AnimatedBackground";
import HeroSection from "../components/HeroSection/HeroSection";
import Features from "../components/Features/Features";
import Analytics from "../components/Analytics/Analytics";
import CTA from "../components/CTA/CTA";
import FadeIn from "../components/FadeIn/FadeIn";
function Home(){

return(

<>

<AnimatedBackground/>

<Navbar/>
<HeroSection />

<FadeIn>
  <Features />
</FadeIn>

<FadeIn delay={0.2}>
  <Analytics />
</FadeIn>

<FadeIn delay={0.4}>
  <CTA />
</FadeIn>



</>

)

}

export default Home;