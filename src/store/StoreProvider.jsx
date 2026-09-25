import React, { createContext, useReducer, useContext } from "react";

export const StoreContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  userRoles: [], // giả sử userRoles lưu roles của user
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        userRoles: action.payload?.roles || [],
      };
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook custom để dễ sử dụng context
export function useAuthStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useAuthStore must be used within a StoreProvider");
  }
  return {
    isAuthenticated: context.state.isAuthenticated,
    user: context.state.user,
    userRoles: context.state.userRoles,
    dispatch: context.dispatch,
  };
}
