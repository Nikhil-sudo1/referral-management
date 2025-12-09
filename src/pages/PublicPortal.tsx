import { useState } from 'react';
import { Link } from 'react-router-dom';
import { universities, programs } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, Users, Gift, Search, ArrowRight, TrendingUp, Star, Zap, Shield, Clock, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PublicPortal = () => {
  const [step, setStep] = useState<'form' | 'track'>('form');
  const [formStep, setFormStep] = useState(1);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');

  const filteredPrograms = programs.filter((p) => p.universityId === selectedUniversity);

  const generateCode = () => {
    const uni = universities.find((u) => u.id === selectedUniversity);
    const code = `${uni?.code || 'REF'}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    return code;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = generateCode();
    setSubmittedCode(code);
    setFormStep(4);
    toast({
      title: 'Referral Submitted!',
      description: `Your referral code is ${code}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Hero Section */}
      <header className="relative gradient-primary text-primary-foreground py-24 md:py-32 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Award className="w-8 h-8" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">Referral Management</h1>
          </div>
          
          <p className="text-xl md:text-2xl lg:text-3xl opacity-95 max-w-3xl mx-auto mb-4 font-light animate-fade-in">
            University-Corporate Referral Platform by TeamLease EdTech
          </p>
          
          <p className="text-base md:text-lg opacity-80 max-w-2xl mx-auto mb-10 animate-fade-in">
            Streamline student referrals from 60+ universities to 900+ corporate partners, tracking placements and measuring employability outcomes
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-12 animate-slide-up">
            <Button
              size="lg"
              variant={step === 'form' ? 'secondary' : 'outline'}
              onClick={() => setStep('form')}
              className={`text-lg px-8 py-6 h-auto ${
                step === 'form' 
                  ? 'bg-primary-foreground text-primary shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all' 
                  : 'bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/50'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Submit Referral
            </Button>
            <Button
              size="lg"
              variant={step === 'track' ? 'secondary' : 'outline'}
              onClick={() => setStep('track')}
              className={`text-lg px-8 py-6 h-auto ${
                step === 'track' 
                  ? 'bg-primary-foreground text-primary shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all' 
                  : 'bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/50'
              }`}
            >
              <Search className="w-5 h-5 mr-2" />
              Track Status
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">6,00,000+</div>
              <div className="text-sm opacity-80">Students Impacted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">60+</div>
              <div className="text-sm opacity-80">Universities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">900+</div>
              <div className="text-sm opacity-80">Corporate Partners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">100%</div>
              <div className="text-sm opacity-80">Employability Focus</div>
            </div>
          </div>
        </div>
      </header>

      {/* Benefits */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Platform Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive referral management connecting universities, students, and corporate partners
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl gradient-primary text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                    <Gift className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-card-foreground mb-2">Student Referral Tracking</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Track student referrals from universities to corporate partners, monitoring placement success and career outcomes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-success/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl gradient-success text-success-foreground shadow-lg group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-card-foreground mb-2">University Network</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Manage referrals across 60+ partner universities with automated tracking and status updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-warning/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl gradient-warning text-warning-foreground shadow-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-card-foreground mb-2">Corporate Integration</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Connect with 900+ corporate partners for seamless student placement and referral tracking.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-info/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl bg-info/10 text-info shadow-lg group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-card-foreground mb-2">Placement Analytics</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Advanced analytics tracking referral success rates, placement outcomes, and ROI metrics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl gradient-primary text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-card-foreground mb-2">Real-time Dashboard</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Live dashboard with animated statistics, conversion funnels, and performance metrics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-success/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl gradient-success text-success-foreground shadow-lg group-hover:scale-110 transition-transform">
                    <DollarSign className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-card-foreground mb-2">Reward System</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Automated reward tracking and disbursement for successful placements and referrals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {step === 'form' ? (
            <Card className="shadow-2xl border-2 border-border/50 hover:shadow-3xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  Submit a Referral
                  {submittedCode && <CheckCircle className="w-6 h-6 text-success" />}
                </CardTitle>
                <CardDescription className="text-base">
                  {formStep < 4 ? `Step ${formStep} of 3` : 'Referral Submitted!'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                {formStep === 4 ? (
                  <div className="text-center py-8 md:py-12">
                    <div className="w-20 h-20 rounded-full gradient-success flex items-center justify-center mx-auto mb-6 shadow-lg animate-fade-in">
                      <CheckCircle className="w-10 h-10 text-success-foreground" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-card-foreground mb-2">Thank You!</h3>
                    <p className="text-muted-foreground mt-2 text-lg">Your referral has been submitted successfully.</p>
                    <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border-2 border-primary/20">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Your Referral Code</p>
                      <p className="text-3xl md:text-4xl font-mono font-bold text-primary mt-1 tracking-wider">{submittedCode}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-6">
                      Save this code to track your referral status
                    </p>
                    <Button
                      size="lg"
                      className="mt-8 gradient-primary text-primary-foreground hover:shadow-lg transform hover:scale-105 transition-all"
                      onClick={() => {
                        setFormStep(1);
                        setSubmittedCode('');
                      }}
                    >
                      Submit Another Referral
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Step indicators */}
                    <div className="flex items-center justify-between mb-10">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all shadow-lg ${
                                s < formStep
                                  ? 'gradient-success text-success-foreground scale-110'
                                  : s === formStep
                                  ? 'gradient-primary text-primary-foreground scale-110 ring-4 ring-primary/20'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {s < formStep ? <CheckCircle className="w-6 h-6" /> : s}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${
                              s <= formStep ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {s === 1 ? 'Referrer' : s === 2 ? 'Referee' : 'Program'}
                            </span>
                          </div>
                          {s < 3 && (
                            <div
                              className={`flex-1 h-1.5 mx-2 rounded-full transition-all ${
                                s < formStep ? 'gradient-success' : 'bg-muted'
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {formStep === 1 && (
                      <div className="space-y-6 animate-fade-in">
                        <div>
                          <h4 className="text-xl font-bold text-card-foreground mb-1">Your Information (Referrer)</h4>
                          <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                        </div>
                        <div className="grid gap-5">
                          <div>
                            <Label htmlFor="referrerName" className="text-base font-medium">Full Name</Label>
                            <Input id="referrerName" placeholder="John Smith" required className="mt-2 h-11" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="referrerPhone" className="text-base font-medium">Phone</Label>
                              <Input id="referrerPhone" type="tel" placeholder="+1 234 567 8900" required className="mt-2 h-11" />
                            </div>
                            <div>
                              <Label htmlFor="referrerEmail" className="text-base font-medium">Email</Label>
                              <Input id="referrerEmail" type="email" placeholder="john@example.com" required className="mt-2 h-11" />
                            </div>
                          </div>
                        </div>
                        <Button type="button" size="lg" className="w-full mt-6 gradient-primary text-primary-foreground hover:shadow-lg" onClick={() => setFormStep(2)}>
                          Continue <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}

                    {formStep === 2 && (
                      <div className="space-y-6 animate-fade-in">
                        <div>
                          <h4 className="text-xl font-bold text-card-foreground mb-1">Student Information (Referee)</h4>
                          <p className="text-sm text-muted-foreground">Tell us about the student you're referring</p>
                        </div>
                        <div className="grid gap-5">
                          <div>
                            <Label htmlFor="refereeName" className="text-base font-medium">Student Full Name</Label>
                            <Input id="refereeName" placeholder="Alice Johnson" required className="mt-2 h-11" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="refereePhone" className="text-base font-medium">Student Phone</Label>
                              <Input id="refereePhone" type="tel" placeholder="+1 234 567 8900" required className="mt-2 h-11" />
                            </div>
                            <div>
                              <Label htmlFor="refereeEmail" className="text-base font-medium">Student Email</Label>
                              <Input id="refereeEmail" type="email" placeholder="alice@example.com" required className="mt-2 h-11" />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setFormStep(1)}>
                            Back
                          </Button>
                          <Button type="button" size="lg" className="flex-1 gradient-primary text-primary-foreground hover:shadow-lg" onClick={() => setFormStep(3)}>
                            Continue <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {formStep === 3 && (
                      <div className="space-y-6 animate-fade-in">
                        <div>
                          <h4 className="text-xl font-bold text-card-foreground mb-1">University & Program</h4>
                          <p className="text-sm text-muted-foreground">Select the university and program for the student</p>
                        </div>
                        <div className="grid gap-5">
                          <div>
                            <Label className="text-base font-medium">Select University</Label>
                            <Select onValueChange={setSelectedUniversity} required>
                              <SelectTrigger className="mt-2 h-11">
                                <SelectValue placeholder="Choose a university" />
                              </SelectTrigger>
                              <SelectContent>
                                {universities.map((uni) => (
                                  <SelectItem key={uni.id} value={uni.id}>
                                    {uni.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-base font-medium">Select Program</Label>
                            <Select disabled={!selectedUniversity} required>
                              <SelectTrigger className="mt-2 h-11">
                                <SelectValue placeholder={selectedUniversity ? "Choose a program" : "Select university first"} />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredPrograms.map((prog) => (
                                  <SelectItem key={prog.id} value={prog.id}>
                                    {prog.name} ({prog.duration})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setFormStep(2)}>
                            Back
                          </Button>
                          <Button type="submit" size="lg" className="flex-1 gradient-primary text-primary-foreground hover:shadow-lg">
                            Submit Referral
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-2xl border-2 border-border/50 hover:shadow-3xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
                <CardTitle className="text-2xl">Track Your Referral</CardTitle>
                <CardDescription className="text-base">Enter your referral code to check the status</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="trackCode" className="text-base font-medium">Referral Code</Label>
                    <Input
                      id="trackCode"
                      placeholder="MIT-MBA-12345"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                      className="mt-2 h-11 text-lg font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter the referral code you received after submission
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full gradient-primary text-primary-foreground hover:shadow-lg transform hover:scale-105 transition-all"
                    onClick={() => {
                      toast({
                        title: 'Status: Contacted',
                        description: 'Your referral is being processed. The student has been contacted.',
                      });
                    }}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Track Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-muted/30 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Award className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-xl text-foreground block">TeamLease EdTech</span>
                <p className="text-xs text-muted-foreground">A TeamLease Group Company</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <p className="text-sm text-muted-foreground">© 2024 TeamLease EdTech Ltd. All rights reserved.</p>
              <Link to="/login" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                Admin Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground mb-2">
              <strong>Mission:</strong> Making Every Learner Employable
            </p>
            <p className="text-xs text-muted-foreground">
              B-903, Western Edge II, Borivali East, Mumbai 400066 | edtech@teamlease.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortal;
