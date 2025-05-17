// A shared utility file for localStorage operations

// Function to notify components about localStorage changes
/**
 * Notifies other components about localStorage changes by dispatching a custom event
 */
export function notifyLocalStorageChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("localStorageChange"))
  }
}


  
  // Helper function to set activeTeam and notify components
  export const setActiveTeam = (teamName: string) => {
    localStorage.setItem("activeTeam", teamName)
    notifyLocalStorageChange()
  }
  
  // Helper function to get activeTeam
  export const getActiveTeam = () => {
    return localStorage.getItem("activeTeam") || ""
  }
  
  