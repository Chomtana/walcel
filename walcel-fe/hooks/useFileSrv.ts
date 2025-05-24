"use client"

import useSWRMutation from "swr/mutation"
import {mutate} from "swr";

export const fileSrvUrl = process.env.NEXT_PUBLIC_FILE_SRV_URL || "http://localhost:5100/api"

/**
 * Type for the payload we send to the API
 */
interface UploadGithubPayload {
  url: string
  branch: string
  envJson: string
  outputDir: string
  address: string
  message: string
  signature: string
}

/**
 * The fetcher that actually calls the external API endpoint with POST.
 */
async function uploadGithubFetcher(
  url: string,
  {arg}: { arg: UploadGithubPayload }
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(arg),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    const message = errorBody?.message || "Error upload by github"
    throw new Error(message)
  }

  return res.json()
}

/**
 * A custom hook that calls the external endpoint (e.g. http://localhost:5100/api/files/upload/github).
 * You can rename "your-api.com" to your actual domain or endpoint.
 */
export function useFileSrv() {
  const {
    trigger,      // function to manually invoke the mutation
    data,         // holds success response data
    error,        // holds error object if the request fails
    isMutating,   // boolean for loading state
  } = useSWRMutation(fileSrvUrl + "/files/upload/github", uploadGithubFetcher)

  /**
   * Wrap trigger() in a user-friendly function.
   */
  async function uploadGithub(payload: UploadGithubPayload) {
    return trigger(payload)
  }

  async function clearFilesCache() {
    await mutate(fileSrvUrl + "/files/upload/github", null, {revalidate: false});
  }

  return {
    uploadGithub: uploadGithub,
    data,
    error,
    isMutating,
    clearFilesCache
  }
}
