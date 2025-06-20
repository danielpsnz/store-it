import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

// Constants
const TOAST_LIMIT = 1; // Maximum number of toasts displayed concurrently
const TOAST_REMOVE_DELAY = 1000000; // Time (in ms) before a toast is automatically removed from the state

// Type that extends basic toast props with additional fields
type ToasterToast = ToastProps & {
  id: string; // Unique identifier for each toast
  title?: React.ReactNode; // Optional title for the toast
  description?: React.ReactNode; // Optional description content
  action?: ToastActionElement; // Optional action button or component
};

// Enum-like object that defines possible toast actions
const actionTypes = {
  ADD_TOAST: "ADD_TOAST", // Action to add a new toast
  UPDATE_TOAST: "UPDATE_TOAST", // Action to update an existing toast's properties
  DISMISS_TOAST: "DISMISS_TOAST", // Action to start dismissing a toast
  REMOVE_TOAST: "REMOVE_TOAST", // Action to remove a toast from the state
} as const;

// Counter used to generate unique toast IDs
let count = 0;

/**
 * Generates a unique string ID for each toast.
 * Ensures IDs stay within the safe integer range.
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Derives a TypeScript type for the actions using the actionTypes object
type ActionType = typeof actionTypes;

// Union type for all possible actions that can be dispatched to the reducer
type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>; // Allows partial updates
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"]; // Optional: If not provided, dismiss all
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"]; // Optional: If not provided, remove all
    };

// State interface defining the shape of the toast manager's state
interface State {
  toasts: ToasterToast[];
}

// Internal map used to track scheduled removal timeouts for each toast
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Schedules a toast to be removed after the predefined delay.
 * Prevents duplicate timeouts for the same toast.
 *
 * @param toastId - The unique identifier of the toast to be removed
 */
const addToRemoveQueue = (toastId: string) => {
  // If there's already a timeout set for this toast, do nothing
  if (toastTimeouts.has(toastId)) {
    return;
  }

  // Schedule the removal of the toast after a delay
  const timeout = setTimeout(() => {
    // Once the delay is over, remove the toast and clear the timeout entry
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  // Store the timeout so we can prevent duplicate scheduling
  toastTimeouts.set(toastId, timeout);
};
// Reducer function to manage toast notifications state based on dispatched actions.
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    // Add a new toast to the beginning of the list.
    // Enforces the TOAST_LIMIT to prevent overflow.
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    // Update an existing toast by ID with new properties.
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    // Marks a toast (or all toasts) as "dismissed" (i.e., sets `open` to false).
    // Also triggers a side-effect by adding toast IDs to a remove queue.
    case "DISMISS_TOAST": {
      const { toastId } = action;

      // Side-effect: schedule toast(s) for removal.
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        // If no specific toast ID is provided, dismiss all toasts.
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      // Set `open` to false for dismissed toast(s), which can be used by UI for transition effects.
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        ),
      };
    }

    // Removes a toast completely from the state.
    // If `toastId` is undefined, remove all toasts.
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

// Internal list of listeners (observers) to be notified whenever the state changes.
const listeners: Array<(state: State) => void> = [];

// Holds the in-memory toast state, separate from any UI framework state.
let memoryState: State = { toasts: [] };

// Dispatch function to trigger state updates via reducer,
// and notify all registered listeners with the new state.
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// Represents a new toast configuration without an ID (which will be generated).
type Toast = Omit<ToasterToast, "id">;

/**
 * Creates and dispatches a new toast.
 * Also returns control functions to dismiss or update the toast later.
 */
function toast({ ...props }: Toast) {
  const id = genId(); // Generate a unique ID for the toast.

  // Function to update the toast with new properties.
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });

  // Function to dismiss the toast (set `open` to false and queue for removal).
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  // Dispatch the initial toast with `open: true` and a callback for auto-dismissal.
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      // Auto-dismiss logic triggered when `open` becomes false (e.g. by UI transition).
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // Return the toast ID and control functions for external use.
  return {
    id,
    dismiss,
    update,
  };
}
/**
 * Custom React hook: useToast
 *
 * This hook provides access to the current toast notifications state and utility functions
 * to create and dismiss toasts. It enables components to listen to toast updates in real time.
 *
 * Assumes the presence of the following external references:
 * - `memoryState`: The shared toast state across the application.
 * - `listeners`: An array of functions subscribed to toast state changes.
 * - `toast`: A function used to create/show a new toast notification.
 * - `dispatch`: A function used to trigger toast-related actions (e.g., dismissing a toast).
 */

function useToast() {
  // Set up local component state, initialized from the global memoryState.
  const [state, setState] = React.useState<State>(memoryState);

  // React useEffect to register the component's setState function as a listener
  // to global toast state updates when the component mounts.
  React.useEffect(() => {
    // Add the component's setState function to the global listeners array.
    listeners.push(setState);

    // Return a cleanup function to remove the listener when the component unmounts.
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1); // Remove the listener to prevent memory leaks.
      }
    };
  }, [state]); // Effect runs whenever the local state changes (though usually listeners remain constant).

  // Return the current toast state, along with helper functions to:
  // - create a new toast via `toast`
  // - dismiss a toast via `dispatch`
  return {
    ...state, // Spread current toast state (e.g., array of toasts)
    toast, // Function to trigger a new toast notification
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), // Dismiss toast by ID
  };
}

// Export the custom hook and the toast creation function
export { useToast, toast };
