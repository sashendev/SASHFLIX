"use client";
import React from "react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">
          You are offline
        </h1>
        <p className="mb-6 text-gray-600">
          It looks like you don\'t have an internet connection.
          <br />
          Some features may be unavailable, but you can still browse previously visited content.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
