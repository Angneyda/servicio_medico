import Link from 'next/link';

interface BreadcrumbProps {
  pageName: string;
  parentName?: string;
  parentHref?: string;
}

const Breadcrumb = ({ pageName, parentName, parentHref }: BreadcrumbProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">
        {pageName}
      </h2>

      <nav>
        <ol className="flex items-center gap-2 text-sm font-medium">
          <li>
            <Link className="text-black hover:text-primary dark:text-white" href="/dashboard">
              Dashboard
            </Link>
          </li>

          {parentName && parentHref && (
            <li className="text-black dark:text-white">
              /
              <Link
                className="pl-1 hover:text-primary"
                href={parentHref}
              >
                {parentName}
              </Link>
            </li>
          )}

          <li className="text-primary">
            / {pageName}
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
