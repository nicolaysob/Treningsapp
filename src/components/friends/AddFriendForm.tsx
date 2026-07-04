import { sendFriendRequest } from "@/app/(app)/friends/actions";

export function AddFriendForm() {
  return (
    <form action={sendFriendRequest} className="friend-add-form mt-5">
      <div className="friend-add-form__field">
        <svg
          className="friend-add-form__icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          name="username"
          required
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Søk etter brukernavn…"
          className="friend-add-form__input"
        />
      </div>
      <button type="submit" className="friend-add-form__submit">
        Legg til
      </button>
    </form>
  );
}
