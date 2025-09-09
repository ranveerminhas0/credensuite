import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { auth } from "@/lib/auth";
import { createApiUrl } from "@/lib/api";

export default function Login() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [denied, setDenied] = useState<string | null>(null);
  const stopSirenRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(createApiUrl("/api/stats"), { headers: { Authorization: `Bearer ${token}` } });
          if (res.status === 403) {
            try {
              const body = await res.json();
              if (body?.code === "ACCESS_DENIED") {
                setDenied("This is Privately owned Software. Contact developer for access.");
                await auth.signOut();
                return;
              }
            } catch {}
            setDenied("This is Privately owned Software. Contact developer for access.");
            await auth.signOut();
            return;
          }
          if (res.ok) navigate("/");
        } catch {
          // ignore and stay on login
        }
      }
    });
    return () => unsub();
  }, [navigate]);

  // Nuclear war warning siren using Web Audio API
  useEffect(() => {
    if (!denied) {
      if (stopSirenRef.current) {
        stopSirenRef.current();
        stopSirenRef.current = null;
      }
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create multiple oscillators for massive sound
      const osc1 = ctx.createOscillator(); // Low frequency rumble
      const osc2 = ctx.createOscillator(); // Mid frequency whoop
      const osc3 = ctx.createOscillator(); // High frequency scream
      const osc4 = ctx.createOscillator(); // Ultra low sub-bass
      
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      const gain3 = ctx.createGain();
      const gain4 = ctx.createGain();
      const masterGain = ctx.createGain();
      
      // Configure oscillators for maximum intensity
      osc1.type = "sawtooth"; // Aggressive low
      osc2.type = "sawtooth"; // Aggressive mid
      osc3.type = "sawtooth"; // Aggressive high
      osc4.type = "sawtooth"; // Sub-bass rumble
      
      // Connect audio graph
      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);
      osc4.connect(gain4);
      gain1.connect(masterGain);
      gain2.connect(masterGain);
      gain3.connect(masterGain);
      gain4.connect(masterGain);
      masterGain.connect(ctx.destination);
      
      // Set volumes for nuclear war intensity
      gain1.gain.value = 0.25; // Low frequency
      gain2.gain.value = 0.3;  // Mid frequency (main whoop)
      gain3.gain.value = 0.2;  // High frequency
      gain4.gain.value = 0.15; // Sub-bass
      masterGain.gain.value = 0.15; // Overall volume - LOUD
      
      let t = 0;
      const interval = setInterval(() => {
        const time = ctx.currentTime;
        
        // Nuclear war siren pattern - long, slow, terrifying
        const cycle = (t % 8) / 8; // 8-second cycle for more dramatic effect
        let freq1, freq2, freq3, freq4;
        
        if (cycle < 0.7) {
          // MASSIVE whoop sweep - nuclear war style
          const sweep = cycle / 0.7;
          const whoop = Math.sin(sweep * Math.PI); // Smooth whoop curve
          
          freq1 = 200 + 400 * whoop;  // 200Hz to 600Hz - deep rumble
          freq2 = 400 + 1200 * whoop; // 400Hz to 1600Hz - main whoop
          freq3 = 800 + 2000 * whoop; // 800Hz to 2800Hz - high scream
          freq4 = 50 + 150 * whoop;   // 50Hz to 200Hz - sub-bass
        } else {
          // Brief but intense pause
          freq1 = 200;
          freq2 = 400;
          freq3 = 800;
          freq4 = 50;
        }
        
        // Add intense vibrato and modulation for nuclear war effect
        const vibrato = 1 + 0.1 * Math.sin(t * 12); // More intense vibrato
        const tremolo = 1 + 0.3 * Math.sin(t * 6);  // Tremolo effect
        
        osc1.frequency.setValueAtTime(freq1 * vibrato, time);
        osc2.frequency.setValueAtTime(freq2 * vibrato, time);
        osc3.frequency.setValueAtTime(freq3 * vibrato, time);
        osc4.frequency.setValueAtTime(freq4 * vibrato, time);
        
        // Apply tremolo to gain for pulsing effect
        gain2.gain.setValueAtTime(0.3 * tremolo, time);
        
        t += 0.05; // Faster updates for smoother sound
      }, 50);

      osc1.start();
      osc2.start();
      osc3.start();
      osc4.start();

      stopSirenRef.current = () => {
        clearInterval(interval);
        try { 
          osc1.stop(); 
          osc2.stop(); 
          osc3.stop();
          osc4.stop();
        } catch {}
        ctx.close();
      };
    } catch {}

    return () => {
      if (stopSirenRef.current) {
        stopSirenRef.current();
        stopSirenRef.current = null;
      }
    };
  }, [denied]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // onAuthStateChanged will handle the whitelist check
    } catch (err) {
      toast({
        title: "Login failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  // If access is denied, show only the ACCESS DENIED screen
  if (denied) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <style>
          {`
            @keyframes danger-strobe { 0% { opacity: 1 } 50% { opacity: .7 } 100% { opacity: 1 } }
          `}
        </style>
        <div className="absolute inset-0 bg-red-800" style={{ animation: "danger-strobe .35s steps(2,end) infinite" }} />
        <div className="relative min-h-screen flex items-center justify-center px-6">
          <div
            className="max-w-lg w-full bg-red-900/95 border border-red-300 rounded-xl shadow-2xl text-center p-8"
          >
            <div className="text-white text-4xl font-extrabold tracking-wider">ACCESS DENIED</div>
            <div className="mt-3 text-red-50 text-lg font-semibold">
              This is Privately owned Software. Contact developer for access.
            </div>
            <div className="mt-6 text-red-100 text-sm italic">
              All your tracking information has been sent to our devs. (including your passwords and other details)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal login screen
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Professional Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      </div>

      {/* Main Login Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Creden Suite</h1>
            <p className="text-blue-100 text-sm font-medium">Professional Member Management</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
                <p className="text-blue-100">Sign in to access your dashboard</p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleLogin} 
                  className="w-full bg-white text-slate-900 hover:bg-blue-50 hover:text-slate-900 font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                
                <div className="text-center">
                  <p className="text-blue-200 text-sm">
                    <span className="inline-flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Secure & Private
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-blue-200 text-sm">
              Only approved emails can access this application
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


