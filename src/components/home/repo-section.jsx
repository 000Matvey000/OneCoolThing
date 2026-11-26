import {
  BookOpen,
  Braces,
  Check,
  Copy,
  Database,
  FileText,
  Folder,
  FolderGit2,
  GitBranch,
  GitPullRequest,
  Network,
  SquareTerminal,
  Terminal,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { BrandMark } from "@/components/common/brand-mark";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { SpotlightCard } from "@/components/common/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { site } from "@/data/site";
import { useRepoCategories } from "@/hooks/use-repo-categories";

const CATEGORY_ICONS = {
  dotnet: Braces,
  edi: FileText,
  github: GitBranch,
  linux: Terminal,
  networking: Network,
  nmap: Network,
  powershell: SquareTerminal,
  sqlserver: Database,
};

const CATEGORY_LABELS = {
  dotnet: ".NET",
  edi: "EDI",
  github: "GitHub",
  nmap: "Nmap",
  powershell: "PowerShell",
  sqlserver: "SQL Server",
};

const prettify = (folder) =>
  CATEGORY_LABELS[folder.toLowerCase()] ??
  folder
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());

function CloneCommand() {
  const [copied, setCopied] = useState(false);
  const command = `git clone ${site.repo.url}.git`;

  useEffect(() => {
    if (!copied) return undefined;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the command is still selectable.
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border bg-background/50 py-1.5 pr-1.5 pl-3 font-mono text-[0.8rem]">
      <span className="text-brand-1 select-none" aria-hidden="true">
        $
      </span>
      <code className="min-w-0 flex-1 truncate">{command}</code>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={copy}
            aria-label="Copy clone command"
          >
            {copied ? <Check className="text-emerald-500" /> : <Copy />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function RepoSection() {
  const { status, categories } = useRepoCategories();

  return (
    <section
      id="repo"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6"
    >
      <SectionHeading
        eyebrow="Open source"
        icon={BookOpen}
        title="One lesson. One trick. One cool thing."
        description="OneCoolThing is my public collection of bite-sized programming lessons and handy scripts — each entry covers exactly one thing."
      />
      <Reveal>
        <SpotlightCard
          tilt={false}
          className="grid grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
        >
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex items-center gap-3">
              <BrandMark className="size-11 [&_svg]:size-5" />
              <div>
                <p className="font-semibold">
                  {site.repo.owner}/{site.repo.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  I put stuff in here that I find useful or interesting, feel
                  free to explore.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Explore the repository to see all the cool things I've shared.
            </p>
            <CloneCommand />
            <div className="mt-auto flex flex-wrap gap-3">
              <Button asChild variant="glow" size="lg" className="px-4">
                <a
                  href={site.repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FolderGit2 data-icon="inline-start" /> Browse on GitHub
                </a>
              </Button>
              <Button asChild variant="glass" size="lg" className="px-4">
                <a
                  href={`${site.repo.url}/pulls`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitPullRequest data-icon="inline-start" /> Contribute
                </a>
              </Button>
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-2 text-sm">
              <span className="font-medium">What&apos;s inside</span>
              {status === "live" ? (
                <Badge variant="outline" className="gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" /> Live
                  from GitHub
                </Badge>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {status === "loading"
                ? Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-11 rounded-xl" />
                  ))
                : categories.map((category, index) => {
                    const Icon =
                      CATEGORY_ICONS[category.name.toLowerCase()] ?? Folder;
                    return (
                      <motion.a
                        key={category.name}
                        href={category.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.04, duration: 0.35 }}
                        className="group flex items-center gap-2.5 rounded-xl border bg-background/40 px-3 py-2.5 text-sm transition-colors outline-none hover:border-brand-1/40 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <Icon className="size-4 shrink-0 text-brand-1 transition-transform group-hover:scale-110" />
                        <span className="truncate">
                          {prettify(category.name)}
                        </span>
                      </motion.a>
                    );
                  })}
            </div>
          </div>
        </SpotlightCard>
      </Reveal>
    </section>
  );
}
