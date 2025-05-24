"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Replace } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import ComboboxComponent from "@/components/combobox";
import { ENS_REGISTRY_ABI, ENS_RESOLVER_ABI } from "@/lib/abi";
import { namehash } from "viem";
import {
  BaseError,
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { encode } from "@ensdomains/content-hash";
import { deploySrvUrl } from "@/hooks/useDeploySrv";

type Props = {
  ipfsCid: string | undefined;
  address: string;
  projectId: string;
  deployId: number;
  disabled?: boolean;
  isUpdateEns?: boolean;
};

const convertCidToContentHash = (cid: string) => `0x${encode("ipfs", cid)}`;

export function AddEnsDialog({
  ipfsCid,
  address,
  projectId,
  deployId,
  disabled,
  isUpdateEns,
}: Props) {
  const [ensName, setEnsName] = useState<{ value: string; label: string }[]>(
    []
  );
  const [selectedEnsName, setSelectedEnsName] = useState<string | null>(null);
  const [isOpened, setIsOpened] = useState(false);

  const { isConnected } = useAccount();
  const { data: hash, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const ENS_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_ENS_REGISTRY_ADDRESS ||
    "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e") as `0x${string}`;
  const { data: resolver } = useReadContract({
    address: ENS_REGISTRY_ADDRESS,
    abi: ENS_REGISTRY_ABI,
    functionName: "resolver",
    args: [namehash(selectedEnsName!)],
    query: {
      enabled: !!selectedEnsName,
    },
  });

  const fetchEnsName = async () => {
    try {
      const res = await fetch(`/api/ens?owner=${address?.toLowerCase()}`);
      const data = await res.json();

      const unwrappedOwner = data.domains || [];
      const wrappedOwner = data.nameWrappeds || [];
      const fetchedDomains = [...unwrappedOwner, ...wrappedOwner];

      // Convert the data to the shape needed by DomainList
      const mapped = fetchedDomains
        .filter((d: { expiryDate: string; name: string }) => {
          return (
            d.name.toLowerCase().endsWith(".eth") &&
            !d.name.toLowerCase().startsWith("[")
          );
        })
        .map((d: { expiryDate: string; name: string }) => {
          return {
            value: d.name,
            label: d.name,
          };
        });
      console.log("mapped", mapped);

      setEnsName(mapped);
    } catch (err) {
      console.error("Error fetching ENS:", err);
      toast.error("Failed to fetch ENS domains.");
    }
  };

  const updateEns = async (projectId: string, ensName: string) => {
    try {
      const apiUrl = `${deploySrvUrl}/deploy/ens/update`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: projectId,
          ensDomain: ensName,
          deployId,
        }),
      });
      return await response.json();
    } catch (err) {
      console.error("Error updating ENS:", err);
    }
  };

  const handleSelection = (value: string) => {
    setSelectedEnsName(value);
  };

  const publishWeb = async () => {
    if (!selectedEnsName || !isConnected || !ipfsCid) return;
    try {
      writeContract({
        address: resolver as `0x${string}`,
        abi: ENS_RESOLVER_ABI,
        functionName: "setContenthash",
        args: [namehash(selectedEnsName), convertCidToContentHash(ipfsCid)],
      });
    } catch (error) {
      console.error("ENS update failed", error);
    }
  };

  useEffect(() => {
    fetchEnsName().catch(console.error);
  }, [address]);

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error("ENS update failed", {
        description: (error as BaseError).shortMessage || error.message,
      });
      console.error("ENS update failed", error);
    }
    if (isConfirming) {
      toast.loading("Confirming transaction", {
        description: "Please wait while the transaction is being confirmed",
      });
    }
    if (isConfirmed) {
      // call the api to update the ens name
      updateEns(projectId, selectedEnsName!).catch(console.error);
      toast.dismiss();
      toast.success("ENS updated successfully", {
        description: `Transaction Hash: ${hash}`,
      });
      setIsOpened(false);
    }
  }, [error, isConfirmed, isConfirming]);

  if (isUpdateEns) {
    return (
      <Button
        variant="ghost"
        disabled={disabled}
        onClick={() => window.open("https://testnet.suins.io/account/my-names")}
      >
        {" "}
        <Replace className="w-4 h-4" /> Update SuiNS Domain
      </Button>
    );
  } else {
    return (
      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => window.open("https://testnet.suins.io/account/my-names")}
      >
        {" "}
        <Plus className="w-4 h-4" /> Link SuiNS Domain
      </Button>
    );
  }

  return (
    <AlertDialog open={isOpened} onOpenChange={setIsOpened}>
      <AlertDialogTrigger asChild>
        {isUpdateEns ? (
          <Button variant="ghost" disabled={disabled}>
            {" "}
            <Replace className="w-4 h-4" /> Update SuiNS Domain
          </Button>
        ) : (
          <Button variant="secondary" disabled={disabled}>
            {" "}
            <Plus className="w-4 h-4" /> Link SuiNS Domain
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isUpdateEns ? "Update ENS Domain" : "Add ENS Domain"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-2 mt-6">
              <Label htmlFor="ipfs-cid">ENS Domain</Label>
              <ComboboxComponent options={ensName} onSelect={handleSelection} />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="md:min-w-36">Cancel</AlertDialogCancel>
          <Button
            className="md:min-w-36"
            onClick={publishWeb}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Save Change"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
