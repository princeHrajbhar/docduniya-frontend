"use client";

import { useRef, useState } from "react";
import { RoleChooser, type AuthMode } from "./RoleChooser";

export function AuthButtons() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<AuthMode>("login");

  const open = (m: AuthMode) => {
    setMode(m);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => open("login")}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          Login
        </button>
        <button
          onClick={() => open("signup")}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Sign Up
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={mode === "login" ? "Choose how to login" : "Choose how to sign up"}
        onClick={(e) => {
          // click on the backdrop (the dialog element itself) closes it
          if (e.target === e.currentTarget) close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-3xl p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-8">
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
          <RoleChooser mode={mode} onPick={close} />
        </div>
      </dialog>
    </>
  );
}
