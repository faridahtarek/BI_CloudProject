/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { 
  Cloud, 
  Upload, 
  User, 
  Briefcase, 
  Calendar, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Server,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Profile, ProfileFormData } from "./types";

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    age: "",
    position: "",
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch("/api/profiles");
      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.image) return;

    setIsSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("age", formData.age);
    data.append("position", formData.position);
    data.append("image", formData.image);

    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        const newProfile = await response.json();
        setProfiles(prev => [newProfile, ...prev]);
        setFormData({ name: "", age: "", position: "", image: null });
        setPreviewUrl(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-500 selection:text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-8 border-b border-slate-700 shrink-0 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold text-lg text-white shadow-inner">A</div>
          <h1 className="text-xl font-semibold tracking-tight">CloudAcademy <span className="text-slate-400 font-normal hidden sm:inline">| Student Deployment Hub</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-300">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            AWS Infrastructure Active
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg shadow transition-colors flex items-center gap-2 font-medium text-sm"
          >
            {showForm ? "Close Console" : <><Plus className="w-4 h-4" /> New Student</>}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-8 p-8 max-w-[1440px] mx-auto w-full">
        {/* Left Column: Form & Registry */}
        <section className={`flex flex-col gap-8 transition-all duration-500 ${showForm ? 'w-full md:w-1/2' : 'w-full'}`}>
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 bg-white">
                  <h2 className="text-lg font-bold text-slate-800">Student Registration</h2>
                  <p className="text-sm text-slate-500">Data will be persisted to RDS and DynamoDB</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex justify-between">
                      Full Name
                      <span className="text-blue-600 font-mono text-[10px]">[DYNAMODB_ATTR]</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Sarah Jenkins" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Age</label>
                      <input 
                        required
                        type="number" 
                        placeholder="22"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Position</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Cloud Intern"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex justify-between">
                      Profile Image
                      <span className="text-orange-600 font-mono text-[10px]">[S3_STORAGE]</span>
                    </label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${previewUrl ? 'border-orange-500 bg-orange-50' : 'bg-slate-50 hover:bg-slate-100 hover:border-orange-300'}`}
                    >
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="h-32 w-32 object-cover rounded-full ring-4 ring-orange-100 shadow-sm" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="text-sm text-slate-600">Click to upload or drag and drop</span>
                          <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        hidden 
                        ref={fileInputRef} 
                        accept="image/*" 
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting || !formData.image}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {isSubmitting ? "Deploying..." : (
                        <>
                          Deploy to Cloud Environment
                          <Cloud className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="registry"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight italic">Registry: {profiles.length} Active Profiles</h2>
                  <div className="text-xs font-mono text-slate-400 uppercase">us-east-1a // live</div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse shadow-sm border border-slate-200"></div>
                    ))}
                  </div>
                ) : profiles.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {profiles.map((profile, index) => (
                      <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 group hover:border-orange-500 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-slate-100 rounded-full shrink-0 flex items-center justify-center overflow-hidden ring-2 ring-slate-50 group-hover:ring-orange-100 transition-all">
                             <img src={profile.imageUrl} className="w-full h-full object-cover" alt={profile.name} />
                          </div>
                          <div className="space-y-0.5 overflow-hidden">
                            <div className="text-lg font-bold text-slate-800 tracking-tight italic truncate group-hover:text-orange-600 transition-colors">{profile.name}</div>
                            <div className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-wider">
                              {profile.position}
                            </div>
                            <div className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                              Age: {profile.age} — Ref: {profile.id.substring(0, 8).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
                    <Server className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Infrastructure idle. No profiles provisioned.</p>
                    <button onClick={() => setShowForm(true)} className="mt-4 text-orange-500 font-bold text-sm uppercase tracking-widest hover:underline transition-all">Init Cluster</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Column: Infrastructure Monitor */}
        <section className="w-full md:w-1/2 flex flex-col gap-6">
          {/* Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Storage Invariants</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold">Metadata</div>
                  <div className="text-sm font-bold text-slate-800">DynamoDB</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-orange-600">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold">Objects</div>
                  <div className="text-sm font-bold text-slate-800">Amazon S3</div>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal / Logs Monitor */}
          <div className="flex-1 bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-sm shadow-xl min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-green-400">$</span>
                <span className="text-slate-200">cloud-project logs --follow</span>
              </div>
              <span className="text-slate-500 text-[10px]">ID: 442-99-EC2-MICRO</span>
            </div>
            
            <div className="space-y-2 opacity-80 overflow-y-auto flex-1 text-xs">
              <p><span className="text-slate-500">[10:14:02]</span> <span className="text-blue-400">INFO:</span> IAM Role: arn:aws:iam::student:role/AppRole validated</p>
              <p><span className="text-slate-500">[10:14:05]</span> <span className="text-blue-400">INFO:</span> RDS Instance: db-master.cf-west-1 connected</p>
              <p><span className="text-slate-500">[10:14:08]</span> <span className="text-blue-400">INFO:</span> S3 Bucket: student-project-images ready</p>
              <p><span className="text-slate-500">[10:14:12]</span> <span className="text-blue-400">INFO:</span> DynamoDB: Partition key 'student_id' indexed</p>
              {profiles.map(p => (
                 <p key={`log-${p.id}`}><span className="text-slate-500">[{new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}]</span> <span className="text-green-400">SUCCESS:</span> New profile '{p.name}' committed to storage</p>
              ))}
              <p className="text-blue-400 animate-pulse font-bold mt-4">&gt; Listening for POST requests on port 80...</p>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                <div className="text-[10px] uppercase text-slate-500 mb-1">Instance Type</div>
                <div className="text-lg text-white font-bold tracking-tight">t3.micro (Free Tier)</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                <div className="text-[10px] uppercase text-slate-500 mb-1">Compute Region</div>
                <div className="text-lg text-white font-bold tracking-tight">us-east-1</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simplified Footer */}
      <footer className="h-14 bg-white border-t border-slate-200 flex items-center justify-between px-8 text-[10px] text-slate-400 shrink-0">
        <div className="font-medium tracking-tight">STUDENT_PROJECT_SKELETON_V2.5.1</div>
        <div className="flex gap-4 uppercase font-bold tracking-tighter">
          <span className="hover:text-orange-500 cursor-help transition-colors">IAM</span>
          <span className="text-slate-200">•</span>
          <span className="hover:text-orange-500 cursor-help transition-colors">S3</span>
          <span className="text-slate-200">•</span>
          <span className="hover:text-orange-500 cursor-help transition-colors">EC2</span>
          <span className="text-slate-200">•</span>
          <span className="hover:text-orange-500 cursor-help transition-colors">RDS</span>
          <span className="text-slate-200">•</span>
          <span className="hover:text-orange-500 cursor-help transition-colors">DYNAMODB</span>
        </div>
      </footer>
    </div>
  );
}
