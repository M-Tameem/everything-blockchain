
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Leaf, TruckIcon, Building, ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [demoRole, setDemoRole] = useState('farmer');

  const API_BASE_URL = 'http://localhost:3001';

  const demoUsers: Record<string, { username: string; password: string; chaincode_alias: string; role: string }> = {
    farmer: { username: 'testf', password: 'testf', chaincode_alias: 'DemoFarmer', role: 'farmer' },
    processor: { username: 'testp', password: 'testp', chaincode_alias: 'DemoProcessor', role: 'processor' },
    distributor: { username: 'testd', password: 'testd', chaincode_alias: 'DemoDistributor', role: 'distributor' },
    retailer: { username: 'testr', password: 'testr', chaincode_alias: 'DemoRetailer', role: 'retailer' },
    certifier: { username: 'testc', password: 'testc', chaincode_alias: 'DemoCertifier', role: 'certifier' },
    admin: { username: 'testa', password: 'testa', chaincode_alias: 'DemoAdmin', role: 'admin' },
  };

  const handleDemoSignup = async () => {
    const userData = demoUsers[demoRole];
    setLoading(true);
    try {
      await login(userData.username, userData.password);
      toast({ title: 'Demo login successful', description: `Logged in as ${demoRole}` });
    } catch (err) {
      try {
        const adminRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin1', password: 'admin1234' })
        });
        const adminData = await adminRes.json();
        if (!adminRes.ok) throw new Error(adminData.error || 'Admin login failed');

        await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminData.token}`
          },
          body: JSON.stringify(userData)
        });

        await login(userData.username, userData.password);
        toast({ title: 'Demo account created', description: `Logged in as ${demoRole}` });
      } catch (e) {
        toast({
          title: 'Demo signup failed',
          description: e instanceof Error ? e.message : 'Unknown error',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      toast({
        title: "Login successful",
        description: "Welcome to FoodTrace!",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center md:text-left space-y-6">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="h-12 w-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Package className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              FoodTrace
            </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">
              Farm to Table
              <br />
              <span className="text-emerald-600">Transparency</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-md">
              Track your food's journey through the supply chain with blockchain-powered transparency.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 max-w-md mx-auto md:mx-0">
            <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
              <Leaf className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">Farm Origins</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Processing</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
              <TruckIcon className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Distribution</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
              <Building className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Retail</span>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the supply chain dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="border-emerald-200 focus:border-emerald-500"
                  placeholder="Enter your username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-emerald-200 focus:border-emerald-500"
                  placeholder="Enter your password"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-4 space-y-2">
              <Label className="text-sm" htmlFor="demoRole">Demo Role</Label>
              <div className="flex items-center space-x-2">
                <Select value={demoRole} onValueChange={setDemoRole}>
                  <SelectTrigger id="demoRole" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="processor">Processor</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="retailer">Retailer</SelectItem>
                    <SelectItem value="certifier">Certifier</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={handleDemoSignup} disabled={loading}>
                  {loading ? 'Working...' : 'Signup Demo'}
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">Demo Credentials Available</p>
              <div className="mt-2 flex items-center justify-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs text-gray-500">Blockchain Secured</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
