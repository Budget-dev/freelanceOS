export default function SettingsAccountPage() {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Account Settings</h3>
      <p className="text-sm text-muted-foreground mb-6">Manage your account details and preferences.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Your Name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="you@example.com" />
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Save Changes</button>
      </div>
    </div>
  );
}
