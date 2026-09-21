export default function SettingsAIPage() {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">AI & Models</h3>
      <p className="text-sm text-muted-foreground mb-6">Configure your OpenAI API key and provider settings.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
          <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="sk-..." />
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Save Key</button>
      </div>
    </div>
  );
}
