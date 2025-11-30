import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Linkedin, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-20 px-6 bg-muted/30">
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
              <div className="p-3 rounded-lg bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Email</p>
                <a 
                  href="mailto:your.email@example.com" 
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  your.email@example.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Phone</p>
                <a 
                  href="tel:+1234567890" 
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  +123 456 7890
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Linkedin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">LinkedIn</p>
                <a 
                  href="https://linkedin.com/in/yourprofile" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  linkedin.com/in/yourprofile
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Location</p>
                <p className="text-muted-foreground">Your City, Country</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-border">
            <p className="text-muted-foreground mb-6">
              Available for full-time opportunities and professional consultations
            </p>
            <Button 
              size="lg"
              className="gradient-primary text-white shadow-medium hover:opacity-90 transition-smooth"
            >
              Schedule a Meeting
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Contact;
