"use client"

import useSWRMutation from "swr/mutation"
import useSWR, {mutate} from "swr";

export const deploySrvUrl = process.env.NEXT_PUBLIC_DEPLOY_SRV_URL || "http://localhost:5200/api"

/**
 * Type for the payload we send to the API
 */
interface DeployPayload {
  deployId: string
}

/**
 * The fetcher that actually calls the external API endpoint with POST.
 */
async function deployFetcher(
  url: string,
  {arg}: { arg: DeployPayload }
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(arg),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    const message = errorBody?.message || "Error deploy by github"
    throw new Error(message)
  }

  return res.json()
}

/**
 * The fetcher that checks the deployment status
 */
async function statusFetcher(url: string) {
  const res = await fetch(url, {method: "GET"})

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    const message = errorBody?.message || "Error checking deployment status"
    throw new Error(message)
  }

  return res.json()
}

/**
 * A custom hook that calls the external endpoint (e.g. http://localhost:5200/api/deploy/start).
 * You can rename "your-api.com" to your actual domain or endpoint.
 */
export function useDeploySrv() {
  const {
    trigger,      // function to manually invoke the mutation
    data,         // holds success response data
    error,        // holds error object if the request fails
    isMutating,   // boolean for loading state
  } = useSWRMutation(deploySrvUrl + "/deploy/start", deployFetcher)

  /**
   * Wrap trigger() in a user-friendly function.
   */
  async function deploy(payload: DeployPayload) {
    return trigger(payload)
  }

  function useDeployStatus(deployId: string) {
    const {data, error, isLoading} = useSWR(deployId && deployId != "" ?`${deploySrvUrl}/deploy/status/${deployId}`: null,
      statusFetcher,
      {refreshInterval: (latestData) => {
          if (!latestData || latestData.status === "processing") {
            return 5000; // Poll every 5 seconds if not complete
          }
          return 0; // Stop polling when status is complete
        },
      }
    )

    return {
      data,
      error,
      isLoading
    }
  }

  async function clearDeployCache() {
    await mutate(`${deploySrvUrl}/deploy/status/${data?.deployId}`, null, { revalidate: false });
    await mutate(deploySrvUrl + "/deploy/start", null, { revalidate: false });
  }

  return {
    deploy,
    data,
    error,
    isMutating,
    useDeployStatus,
    clearDeployCache
  }
}
