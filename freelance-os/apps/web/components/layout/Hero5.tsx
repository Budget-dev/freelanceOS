import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalysisCardMockup } from "@/components/ui/analysis-card-mockup";

export const Hero5 = () => {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["smarter", "faster", "safer", "sharper", "verified"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-start justify-center pt-6 md:pt-10 pb-16 px-4">
      <div className="container mx-auto">
        <div className="flex gap-5 md:gap-6 items-center justify-center flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="secondary" size="sm" className="gap-2 rounded-full px-5">
              See how FreelanceOS works <MoveRight className="w-4 h-4" />
            </Button>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-3 flex-col"
          >
            <h1 className="text-4xl md:text-6xl max-w-2xl tracking-tighter text-center font-regular">
              <span>Apply to freelance work</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center h-[1.3em] md:pb-2 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-base md:text-lg leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center mx-auto">
              Reading a project brief, spotting red flags, and writing a proposal
              that doesn't oversell you shouldn't take hours. FreelanceOS
              analyzes the opportunity, checks it against your real profile, and
              hands you a truth-checked proposal you can trust.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto px-4 sm:px-0"
          >
            <Button size="lg" className="rounded-full px-6 w-full sm:w-auto" variant="outline">
              See a live analysis
            </Button>
            <Button size="lg" className="gap-3 rounded-full px-6 w-full sm:w-auto">
              Start analyzing free <MoveRight className="w-4 h-4" />
            </Button>
          </motion.div>
          
          {/* Analysis Card Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="w-full w-full transform scale-90 md:scale-95 origin-top -mt-2"
          >
            <AnalysisCardMockup />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
