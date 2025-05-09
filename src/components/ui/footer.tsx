import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-background py-4">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Task Management System. All rights
          reserved.
        </p>
        <div className="flex items-center space-x-1">
          <p className="text-sm text-muted-foreground">Built by</p>
          <Link
            href="https://github.com/RajputKartikeya"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline"
          >
            Kartikeya Rajput
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="https://github.com/RajputKartikeya"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline"
          >
            GitHub
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="https://www.linkedin.com/in/kartikeyarajput7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline"
          >
            LinkedIn
          </Link>
        </div>
      </div>
    </footer>
  );
}
