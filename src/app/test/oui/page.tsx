"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function ExamplePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fonction pour faire défiler vers une section spécifique
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Navigation fixe en haut */}
      <header className="py-4 px-4 sticky top-0 bg-black/80 backdrop-blur-sm z-50">
        <div className="container max-w-6xl mx-auto flex items-center justify-center gap-6">
          <Button 
            onClick={() => scrollToSection('section1')} 
            variant="ghost" 
            className="hover:bg-accent rounded-xl hover:text-primary"
          >
            Section 1
          </Button>
          <Button 
            onClick={() => scrollToSection('section2')} 
            variant="ghost" 
            className="hover:bg-accent rounded-xl hover:text-primary"
          >
            Section 2
          </Button>
          <Button 
            onClick={() => scrollToSection('section3')} 
            variant="ghost" 
            className="hover:bg-accent rounded-xl hover:text-primary"
          >
            Section 3
          </Button>
          <Button 
            onClick={() => scrollToSection('section4')} 
            variant="ghost" 
            className="hover:bg-accent rounded-xl hover:text-primary"
          >
            Section 4
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Section 1 - Rouge */}
        <section 
          id="section1" 
          className="py-20 min-h-[80vh] flex items-center justify-center bg-gradient-to-r from-red-900/30 to-red-700/30"
        >
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Section 1</h2>
            <p className="text-lg mb-8">Ceci est la première section de la page.</p>
            <Button 
              onClick={() => scrollToSection('section2')} 
              className="bg-red-600 hover:bg-red-700"
            >
              Aller à la section 2
            </Button>
          </div>
        </section>

        {/* Section 2 - Bleu */}
        <section 
          id="section2" 
          className="py-20 min-h-[80vh] flex items-center justify-center bg-gradient-to-r from-blue-900/30 to-blue-700/30"
        >
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Section 2</h2>
            <p className="text-lg mb-8">Ceci est la deuxième section de la page.</p>
            <Button 
              onClick={() => scrollToSection('section3')} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Aller à la section 3
            </Button>
          </div>
        </section>

        {/* Section 3 - Vert */}
        <section 
          id="section3" 
          className="py-20 min-h-[80vh] flex items-center justify-center bg-gradient-to-r from-green-900/30 to-green-700/30"
        >
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Section 3</h2>
            <p className="text-lg mb-8">Ceci est la troisième section de la page.</p>
            <Button 
              onClick={() => scrollToSection('section4')} 
              className="bg-green-600 hover:bg-green-700"
            >
              Aller à la section 4
            </Button>
          </div>
        </section>

        {/* Section 4 - Violet */}
        <section 
          id="section4" 
          className="py-20 min-h-[80vh] flex items-center justify-center bg-gradient-to-r from-purple-900/30 to-purple-700/30"
        >
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Section 4</h2>
            <p className="text-lg mb-8">Ceci est la dernière section de la page.</p>
            <Button 
              onClick={() => scrollToSection('section1')} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              Retour en haut
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Exemple de navigation interne avec React</p>
      </footer>
    </div>
  );
}
