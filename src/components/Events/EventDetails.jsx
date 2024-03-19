import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import Header from "../Header.jsx";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";

import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeletion,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none", //because still on detailpage before navigate
      });
      navigate("/events");
    },
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  function hanleDelete() {
    mutate({ id: params.id });
  }

  let content;

  if (isPending) {
    content = (
      <div style={{ textAlign: "center" }}>
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="Error fetching infos"
        message={error.info?.message || "failed to fetch infos"}
      />
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p> do you want to delete this event ?</p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting please wait...</p>}
            {!isPendingDeletion && (
              <>
                <button onClick={handleStopDelete} className="button-text">
                  Cancel
                </button>
                <button onClick={hanleDelete} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeletion && (
            <ErrorBlock
              title="fail to delete"
              message={
                deleteError.info?.message || "fail to delete, please try later"
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
