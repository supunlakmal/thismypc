export interface AuthTypes {
  userID: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  authentication_key: string | null;
}

const INITIAL_STATE: AuthTypes = {
  userID: null,
  firstName: null,
  lastName: null,
  email: null,
  authentication_key: null,
};

type Action = { type: string; payload: any };

const auth = (state: AuthTypes = INITIAL_STATE, action: Action): AuthTypes => {
  switch (action.type) {
    default:
      return state;
  }
};

export default auth;
