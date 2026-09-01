import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle, MapPin, GlobeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SocialLinks from "@/components/SocialLinks";

const Contact = () => {
  return (
    <section id="contact" className="py-20 px-6 bg-muted/30 scroll-mt-20">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-foreground mb-4">Let's Connect</h2>
          <p className="text-muted-foreground text-lg">
            Ready to discuss how I can contribute to your organization
          </p>
        </div>

        <Card className="p-8 md:p-12 shadow-medium">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10"><Mail className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="font-semibold text-foreground mb-1">Email</p>
                <a href="mailto:kingnorku@gmail.com" className="text-muted-foreground hover:text-primary transition-smooth break-all">kingnorku@gmail.com</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10"><Phone className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="font-semibold text-foreground mb-1">Phone</p>
                <div className="flex flex-wrap gap-2 text-muted-foreground">
                  <a href="tel:+233542069136" className="hover:text-primary transition-smooth">+233 542 069 136</a>
                  <span>|</span>
                  <a href="tel:+233208791163" className="hover:text-primary transition-smooth">+233 208 791 163</a>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10"><MessageCircle className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="font-semibold text-foreground mb-1">WhatsApp</p>
                <a href="https://wa.me/233208791163" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-smooth">Chat on WhatsApp</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10"><MessageCircle className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="font-semibold text-foreground mb-1">LinkedIn</p>
                <a href="https://www.linkedin.com/in/kingsleynorku" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-smooth">Connect on LinkedIn</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10"><GlobeIcon className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="font-semibold text-foreground mb-1">Website</p>
                <Link to="/cv" className="text-muted-foreground hover:text-primary transition-smooth">View CVs and cover letters</Link>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10"><MapPin className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="font-semibold text-foreground mb-1">Location</p>
                <p className="text-muted-foreground">Prampram, Greater-Accra, Ghana</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <div className="mb-8 text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Professional profiles</p>
              <SocialLinks />
            </div>
            <div className="text-center border-t border-border pt-8">
              <p className="text-muted-foreground mb-6">Available for full-time opportunities and professional consultations</p>
              <Button size="lg" asChild className="gradient-primary text-primary-foreground shadow-medium hover:opacity-90 transition-smooth">
                <a href="mailto:kingnorku@gmail.com?subject=Meeting%20request">Schedule a Meeting</a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Contact;
