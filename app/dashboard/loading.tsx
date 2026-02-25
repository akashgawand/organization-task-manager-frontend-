import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function DashboardLoading() {
    return (
        <div className="flex w-full h-full items-center justify-center min-h-[50vh]">
            <LoadingSpinner size="xl" />
        </div>
    );
}
