import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Skills from "@/components/Skills";
import Interests from "@/components/Interests";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Experience />
      <Skills />
      <Education />
      <Interests />
      <Contact />
      
      <footer className="bg-primary text-primary-foreground py-8 px-6 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Professional Portfolio. All rights reserved.
        </p>
      </footer>
    </main>
  );
};

export default Index;
