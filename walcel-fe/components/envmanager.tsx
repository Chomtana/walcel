"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Upload } from "lucide-react";

export interface EnvVar {
  key: string;
  value: string;
}
interface EnvManagerProps {
  isDisabled?: boolean;
  envVars: EnvVar[];
  setEnvVars: (envs: EnvVar[]) => void;
}

export default function EnvManager({ isDisabled, envVars, setEnvVars }: EnvManagerProps) {

  // Handle input change
  const handleChange = (index: number, field: "key" | "value", value: string) => {
    const updatedVars = [...envVars];
    updatedVars[index][field] = value;
    setEnvVars(updatedVars);
  };

  // Add new env row
  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  // Remove an env row
  const removeEnvVar = (index: number) => {
    if (envVars.length === 1) return;
    const updatedVars = envVars.filter((_, i) => i !== index);
    setEnvVars(updatedVars);
  };

  // Read .env file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsedVars = text
      .split("\n")
      .filter((line) => line.includes("=") && !line.startsWith("#"))
      .map((line) => {
        const [key, value] = line.split("=");
        return { key: key.trim(), value: value.trim() };
      });

    envVars = envVars.filter((env) => env.key !== "");

    setEnvVars([...envVars, ...parsedVars]);
  };

  return (
    <div className="space-y-4">
      {/* Upload File Button */}
      <label className="flex items-center gap-2 cursor-pointer">
        <Upload className="w-5 h-5" />
        <span className="text-sm hover:text-blue-600">Upload .env file to parse</span>
        <input type="file" onChange={handleFileUpload} className="hidden" />
      </label>

      {/* Env Variables List */}
      {envVars.map((env, index) => (
        <div key={index} className="flex gap-2">
          <Input
            type="text"
            placeholder="e.g. CLIENT_KEY"
            value={env.key}
            onChange={(e) => handleChange(index, "key", e.target.value)}
            className="flex-1"
            disabled={isDisabled}
          />
          <Input
            type="text"
            placeholder="Value"
            value={env.value}
            onChange={(e) => handleChange(index, "value", e.target.value)}
            className="flex-1"
            disabled={isDisabled}
          />
          <Button variant="ghost" size="icon" onClick={() => removeEnvVar(index)} disabled={isDisabled}>
            <Trash className="w-5 h-5 text-red-500" />
          </Button>
        </div>
      ))}

      {/* Add New Variable Button */}
      <Button onClick={addEnvVar} className="flex items-center gap-2" variant="ghost" disabled={isDisabled}>
        <Plus className="w-4 h-4" /> Add Another
      </Button>
    </div>
  );
}