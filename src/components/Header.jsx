import { useIsFetching } from "@tanstack/react-query";

export default function Header({ children }) {
  const fetching = useIsFetching(); // 0 if not fetching or Higher number
  return (
    <>
      <div id="main-header-loading">{fetching > 0 && <progress />}</div>
      <header id="main-header">
        <div id="header-title">
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
