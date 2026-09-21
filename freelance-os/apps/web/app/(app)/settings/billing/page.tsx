export default function SettingsBillingPage() {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Billing</h3>
      <p className="text-sm text-muted-foreground mb-6">Manage your subscription and billing history.</p>
      
      <div className="rounded-md bg-gray-50 p-4 border">
        <h4 className="text-sm font-medium text-gray-900">Current Plan</h4>
        <p className="mt-1 text-sm text-gray-500">You are currently on the Free plan.</p>
        <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Upgrade to Pro</button>
      </div>
    </div>
  );
}
