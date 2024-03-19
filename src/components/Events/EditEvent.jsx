import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
  useNavigation,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { updateEvent, fetchEvent, queryClient } from "../../util/http.js";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const submit = useSubmit();
  const { state } = useNavigation();

  const { data, isError, error } = useQuery({
    queryKey: ["event", { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
    staleTime: 10000,
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;
  //     await queryClient.cancelQueries({
  //       queryKey: ["events", { id: params.id }],
  //     });
  //     const previousEvent = queryClient.getQueryData([
  //       "events",
  //       { id: params.id },
  //     ]);
  //     queryClient.setQueriesData(["events", { id: params.id }], newEvent);
  //     return { previousEvent: previousEvent };
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(
  //       ["events", { id: params.id }],
  //       context.previousEvent
  //     );
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events", { id: params.id }]);
  //   },
  // });

  // function handleSubmit(formData) {
  //   mutate({ id: params.id, event: formData });
  //   navigate("../");
  // }

  function handleSubmit(formData) {
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Error editing"
          message={error.info?.message || "failed to edit infos, check inputs"}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["event", { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(["events"]);
  return redirect("../");
}
