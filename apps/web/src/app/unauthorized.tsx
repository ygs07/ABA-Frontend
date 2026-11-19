import { NoPermission } from '@/components/patterns/NoPermission';

export default function Unauthorized() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-8">
      <NoPermission module="this area (Not Authenticated)" backHref="/auth/login" />
    </div>
  );
}
