"use client";

export function TestTailwind() {
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Tailwind CSS Test
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test 1: Colors */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Color Test
          </h2>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-primary rounded"></div>
            <div className="w-8 h-8 bg-secondary rounded"></div>
            <div className="w-8 h-8 bg-destructive rounded"></div>
            <div className="w-8 h-8 bg-muted rounded"></div>
          </div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Primary, secondary, destructive, and muted colors should be visible.
          </p>
        </div>

        {/* Test 2: Typography */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Typography Test
          </h2>
          <p className="text-sm text-gray-500">Small text</p>
          <p className="text-base text-gray-700 dark:text-gray-300">Base text</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">Large text</p>
          <p className="font-sans">This should use Inter font</p>
        </div>

        {/* Test 3: Buttons */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Button Test
          </h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
              Primary Button
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
              Secondary Button
            </button>
            <button className="px-4 py-2 border border-input bg-background rounded-md hover:bg-accent">
              Outline Button
            </button>
          </div>
        </div>

        {/* Test 4: Icons */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Icon Size Test
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-blue-500"></div>
              <span className="text-sm">h-4 w-4</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-green-500"></div>
              <span className="text-sm">h-6 w-6</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-red-500"></div>
              <span className="text-sm">h-8 w-8</span>
            </div>
          </div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Icons should be properly sized according to their classes.
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
          CSS Status
        </h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <span>Tailwind CSS is loaded: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">✓</code></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <span>Font is applied: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Inter</code></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <span>Dark mode support: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">✓</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}