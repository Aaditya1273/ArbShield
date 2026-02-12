"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, Info, Loader2, CheckCircle2 } from "lucide-react";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { COMPLIANCE_ATTRIBUTES } from "@/lib/contracts";

const attributeOptions = [
  {
    value: COMPLIANCE_ATTRIBUTES.CREDIT_SCORE,
    label: "Credit Score Range",
    description: "Prove credit score > 700 without revealing exact score",
  },
  {
    value: COMPLIANCE_ATTRIBUTES.ACCREDITED_INVESTOR,
    label: "Accredited Investor",
    description: "Prove accredited investor status per SEC requirements",
  },
  {
    value: COMPLIANCE_ATTRIBUTES.KYC_VERIFIED,
    label: "KYC Verified",
    description: "Prove KYC completion without revealing identity",
  },
  {
    value: COMPLIANCE_ATTRIBUTES.US_PERSON,
    label: "US Person Status",
    description: "Prove US person status for regulatory compliance",
  },
];

export function GenerateProofStep() {
  const { nextStep, prevStep } = useOnboardingStore();
  const [selectedAttribute, setSelectedAttribute] = useState(COMPLIANCE_ATTRIBUTES.CREDIT_SCORE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proofGenerated, setProofGenerated] = useState(false);
  const [proofData, setProofData] = useState<string>("");

  const handleGenerateProof = async () => {
    setIsGenerating(true);
    
    // Simulate ZK proof generation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // Generate mock proof data
    const mockProof = `0x${Array.from({ length: 128 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;
    
    setProofData(mockProof);
    setProofGenerated(true);
    setIsGenerating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          Generate ZK Proof
        </CardTitle>
        <CardDescription>
          Select an attribute to prove and generate a zero-knowledge proof
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="size-4" />
          <AlertDescription>
            Zero-knowledge proofs allow you to prove compliance without revealing sensitive data.
            The proof is generated locally and only the verification happens on-chain.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Label>Select Compliance Attribute</Label>
          <RadioGroup value={selectedAttribute} onValueChange={setSelectedAttribute}>
            {attributeOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="space-y-1 leading-none">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {proofGenerated && (
          <div className="space-y-2">
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="size-4 text-green-500" />
              <AlertDescription className="text-green-500">
                Proof generated successfully!
              </AlertDescription>
            </Alert>
            
            <div className="rounded-lg border p-4 space-y-2">
              <div className="text-sm font-medium">Generated Proof</div>
              <div className="text-xs font-mono text-muted-foreground break-all">
                {proofData}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Proof size: {proofData.length} bytes | Attribute: {selectedAttribute}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={prevStep} variant="outline" className="flex-1">
            Back
          </Button>
          
          {!proofGenerated ? (
            <Button
              onClick={handleGenerateProof}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating Proof...
                </>
              ) : (
                "Generate Proof"
              )}
            </Button>
          ) : (
            <Button onClick={nextStep} className="flex-1">
              Continue to Verification
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
