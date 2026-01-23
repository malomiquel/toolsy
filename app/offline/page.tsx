"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icône */}
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-100 p-6">
            <WifiOff className="w-16 h-16 text-blue-600" />
          </div>
        </div>

        {/* Titre */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Vous êtes hors ligne
          </h1>
          <p className="text-gray-600">
            Vous n'êtes pas connecté à Internet pour le moment.
          </p>
        </div>

        {/* Message */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-left">
            Fonctionnalités disponibles hors ligne :
          </h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Calculateur de salaire brut/net</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Outils précédemment visités en cache</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Interface complète de l'application</span>
            </li>
          </ul>
        </div>

        {/* Action */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer la connexion
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>
        </div>

        {/* Info */}
        <p className="text-sm text-gray-500">
          Une fois la connexion rétablie, toutes les fonctionnalités seront à nouveau disponibles.
        </p>
      </div>
    </div>
  );
}
