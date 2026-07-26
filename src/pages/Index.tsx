import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Skills from "@/components/Skills";
import Interests from "@/components/Interests";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Experience />
      <Skills />
      <Education />
      <Interests />
      <Contact />
      
      <footer className="bg-primary text-primary-foreground py-8 px-6 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Kingsley Junior Norku. All rights reserved.
        </p>
      </footer>
    </main>
  );
};

export default Index;
