"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, Info, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { COMPLIANCE_ATTRIBUTES } from "@/lib/contracts";
import {
  generateZKProof,
  verifyZKProofLocally,
  getCircuitInfo,
  estimateVerificationGas,
  type ZKProof,
} from "@/lib/zkproof";

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
  const [proof, setProof] = useState<ZKProof | null>(null);
  const [error, setError] = useState<string>("");
  const [estimatedGas, setEstimatedGas] = useState<number>(0);

  const handleGenerateProof = async () => {
    setIsGenerating(true);
    setError("");
    
    try {
      // Generate ZK proof using snarkjs
      const generatedProof = await generateZKProof({
        attributeType: selectedAttribute,
        attributeValue: 750, // Example: credit score of 750
        threshold: 700, // Proving score > 700
        userSecret: crypto.randomUUID(), // Random user secret
      });

      // Verify proof locally before proceeding
      const isValid = await verifyZKProofLocally(generatedProof);
      
      if (!isValid) {
        throw new Error("Local proof verification failed");
      }

      // Estimate gas for on-chain verification
      const gas = estimateVerificationGas(generatedProof);
      setEstimatedGas(gas);

      setProof(generatedProof);
      setProofGenerated(true);

      // Store proof in session storage for next step
      sessionStorage.setItem("zkProof", JSON.stringify(generatedProof));
      sessionStorage.setItem("selectedAttribute", selectedAttribute);
    } catch (err: any) {
      console.error("Proof generation error:", err);
      setError(err.message || "Failed to generate proof. Please try again.");
    } finally {
      setIsGenerating(false);
    }
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
            The proof is generated locally using snarkjs and only the verification happens on-chain.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Label>Select Compliance Attribute</Label>
          <RadioGroup 
            value={selectedAttribute} 
            onValueChange={setSelectedAttribute}
            disabled={proofGenerated}
          >
            {attributeOptions.map((option) => {
              const circuitInfo = getCircuitInfo(option.value);
              return (
                <div key={option.value} className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Circuit: {circuitInfo.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {proofGenerated && proof && (
          <div className="space-y-2">
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="size-4 text-green-500" />
              <AlertDescription className="text-green-500">
                Proof generated and verified locally!
              </AlertDescription>
            </Alert>
            
            <div className="rounded-lg border p-4 space-y-3">
              <div className="text-sm font-medium">Generated Proof (Groth16)</div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">pi_a:</div>
                  <div className="text-xs font-mono text-muted-foreground break-all bg-muted/50 p-2 rounded">
                    [{proof.proof.pi_a.slice(0, 2).join(", ")}]
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Public Signals:</div>
                  <div className="text-xs font-mono text-muted-foreground break-all bg-muted/50 p-2 rounded">
                    [{proof.publicSignals.join(", ")}]
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                <div>
                  <span className="text-muted-foreground">Protocol:</span>{" "}
                  <span className="font-mono">{proof.proof.protocol}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Curve:</span>{" "}
                  <span className="font-mono">{proof.proof.curve}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Attribute:</span>{" "}
                  <span className="font-mono">{selectedAttribute}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Est. Gas:</span>{" "}
                  <span className="font-mono text-green-500">~{estimatedGas.toLocaleString()}</span>
                </div>
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
