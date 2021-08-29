import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { deleteRequest, get, post, put } from "../api/commonApi";

function useApi() {
  const dispatch = useDispatch();
  const [actions, setActions] = useState<any>({});
  const [baseUrl, setBaseUrl] = useState("");
  const [customInput, setCustomInput] = useState({});
  const [isEnCoded, setEnCoded] = useState(false);
  const [method, setMethod] = useState("POST");
  const [portType, setPortType] = useState("");
  const [postValues, setPostValues] = useState({});

  const requestAPI = () => {
    switch (method) {
      case "POST":
        return post();

      case "GET":
        return get();

      case "PUT":
        return put();

      case "DELETE":
        return deleteRequest();

      default:
        return get();
    }
  };

  useEffect(() => {
    if (baseUrl && baseUrl != "") {
      const requestAPICall = () => {
        actions.request &&
          dispatch({
            type: actions.request,
            payload: { customInput },
          });
        const result = requestAPI();

        result
          .then((response: { status: any; data: any }) => {
            switch (response.status) {
              case 200:
                dispatch({
                  type: actions.success,
                  payload: { customInput, dataWrapper: response.data },
                });
                break;

              default:
                dispatch({
                  type: actions.fail,
                  payload: { customInput, dataWrapper: response.data },
                });

                break;
            }
          })
          .catch((error: any) => {
            dispatch({
              type: actions.fail,
              payload: error,
              customInput,
            });
          });

        setBaseUrl("");
      };

      requestAPICall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const submitForm = (
    fail: string,
    isEnCoded: boolean = false,
    method: string,
    portType: string,
    postValues: object | null,
    request: string,
    success: string,
    url: string,
    customInput?: object
  ) => {
    const newActions = { request, success, fail };
    const mergedActions = { ...actions, ...newActions };

    customInput && setCustomInput(customInput);

    setMethod(method);
    setActions(mergedActions);
    setPostValues(postValues || {});
    setEnCoded(isEnCoded);
    setPortType(portType);
    setBaseUrl(url);
  };

  return [submitForm];
}

export default useApi;
