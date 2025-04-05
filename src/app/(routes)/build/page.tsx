"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Parameter } from "@/types/template";
import MonacoEditor from "@monaco-editor/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ClipboardCopy, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
export default function BuildPage() {
  const { publicKey } = useWallet();
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [executionCode, setExecutionCode] = useState("");
  const [published, setPublished] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const addParameter = () => {
    setParameters([
      ...parameters,
      {
        name: "",
        type: "string",
        description: "",
        required: true,
      },
    ]);
  };

  const updateParameter = (index: number, field: keyof Parameter, value: any) => {
    const updatedParameters = [...parameters];
    updatedParameters[index] = {
      ...updatedParameters[index],
      [field]: value,
    };
    setParameters(updatedParameters);
  };

  const removeParameter = (index: number) => {
    const updatedParameters = [...parameters];
    updatedParameters.splice(index, 1);
    setParameters(updatedParameters);
  };

  if (!publicKey) {
    return (
      <div className="w-full py-6 px-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Build Custom Tools</h1>
          <p className="text-muted-foreground">
            Please connect your wallet to build custom tools.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full py-6 px-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Build Custom Tools</h1>
        <p className="text-muted-foreground">
          Create, test, and publish your own custom tools for the marketplace
        </p>
      </div>
      <div className="md:col-span-2">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Tool name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Name your tool"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background"
                />
              </div>

              {/* Tool description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add a short description about what this tool does"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background min-"
                />
              </div>
              {/* Tool picture */}
              <div className="space-y-2">
                <Label htmlFor="picture">Picture</Label>
                <Input
                  id="picture"
                  type="file"
                  className="bg-background"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>


              {/* Parameters */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Parameters</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addParameter}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Parameter
                  </Button>
                </div>

                {parameters.length === 0 ? (
                  <div className="text-center p-4 border border-dashed border-border rounded-md">
                    <p className="text-muted-foreground">No parameters added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {parameters.map((param, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 p-4 border border-border rounded-md bg-background">
                        {/* Parameter name */}
                        <div className="col-span-12 md:col-span-3">
                          <Label htmlFor={`param-name-${index}`} className="mb-2 block">Name</Label>
                          <Input
                            id={`param-name-${index}`}
                            value={param.name}
                            onChange={(e) => updateParameter(index, "name", e.target.value)}
                            placeholder="name"
                          />
                        </div>

                        {/* Parameter type */}
                        <div className="col-span-6 md:col-span-3">
                          <Label htmlFor={`param-type-${index}`} className="mb-2 block">Type</Label>
                          <Select
                            value={param.type}
                            onValueChange={(value) => updateParameter(index, "type", value)}
                          >
                            <SelectTrigger id={`param-type-${index}`}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                              <SelectItem value="object">Object</SelectItem>
                              <SelectItem value="array">Array</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Required toggle */}
                        <div className="col-span-6 md:col-span-3">
                          <Label htmlFor={`param-required-${index}`} className="mb-2 block">Required</Label>
                          <Select
                            value={param.required ? "true" : "false"}
                            onValueChange={(value) => updateParameter(index, "required", value === "true")}
                          >
                            <SelectTrigger id={`param-required-${index}`}>
                              <SelectValue placeholder="Required?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Remove button */}
                        <div className="col-span-12 md:col-span-3 flex items-end justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeParameter(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Parameter description */}
                        <div className="col-span-12">
                          <Label htmlFor={`param-desc-${index}`} className="mb-2 block">Description</Label>
                          <Input
                            id={`param-desc-${index}`}
                            value={param.description}
                            onChange={(e) => updateParameter(index, "description", e.target.value)}
                            placeholder="Describe what this parameter does"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Execution code */}
              <div className="space-y-2">
                <Label htmlFor="execution-code">Function Code</Label>
                <div className="relative">
                  <MonacoEditor
                    height="300px"
                    defaultLanguage="typescript"
                    value={executionCode}
                    onChange={(value) => setExecutionCode(value || "")}
                    className="font-mono bg-background min-h-60 p-4"
                    theme="vs-dark"
                  />
                </div>
              </div>

              {/* NFT Price */}
              <div className="space-y-2">
                <Label htmlFor="nft-price">NFT Price (Sol)</Label>
                <Input
                  id="nft-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="json-url">Tool JSON URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="json-url"
                    // value={`https://plum-accurate-bobcat-724.mypinata.cloud/ipfs/${url || ''}`}
                    readOnly
                    className="bg-background flex-grow"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // const urloui = `https://plum-accurate-bobcat-724.mypinata.cloud/ipfs/${url || ''}`;
                      // navigator.clipboard.writeText(urloui);
                      // toast("URL copied to clipboard");
                    }}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                // onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button
                // onClick={saveTool}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {/* {isEditing ? "Update Tool" : "Save Tool"} */}
                </Button>
                <Button
                // onClick={createTemplate}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}