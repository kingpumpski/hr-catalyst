import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center px-6 py-20 gradient-primary overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzRoLTJ6TTM0IDM0djItMmgyVjM0aC0yem0wLTJ2Mmgydi0yaC0yem0tMiAwdjJoMnYtMmgtMnptMC0ydjJoMnYtMmgtMnptLTIgMHYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0yLTJ2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bTItMnYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      
      <div className="container max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-white mb-4 leading-tight">
            Professional Claims & Human Resource Management
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light mb-2">
            Kingsley Junior Norku
          </p>
          <p className="text-lg text-white/80">
            BSc. Accounting | 6+ Years Experience in Accounting, HR, Operations & Management
          </p>
        </div>

        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
          Versatile professional with comprehensive experience in executive assistance, 
          claims management, IT operations, and staff development. Proven track record 
          in recruitment, team leadership, and organizational efficiency.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-medium transition-smooth"
          >
            <Download className="mr-2 h-5 w-5" />
            Download CV
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 transition-smooth"
          >
            <Mail className="mr-2 h-5 w-5" />
            Get in Touch
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
