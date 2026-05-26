export function normalizeText(value?: string | null): string {
  if (!value) return "";
  return value.toLowerCase().trim();
}

export function parsePostedAtToDays(postedAt?: string | null): number {
  if (!postedAt) return 999;
  const text = postedAt.toLowerCase();
  
  if (
    text.includes("just now") || 
    text.includes("today") || 
    text.includes("hour") || 
    text.includes("minute") ||
    text.includes("second")
  ) {
    return 0;
  }
  
  const daysMatch = text.match(/(\d+)\s*day/);
  if (daysMatch) {
    return parseInt(daysMatch[1], 10);
  }
  
  const weeksMatch = text.match(/(\d+)\s*week/);
  if (weeksMatch) {
    return parseInt(weeksMatch[1], 10) * 7;
  }

  const monthsMatch = text.match(/(\d+)\s*month/);
  if (monthsMatch) {
    return parseInt(monthsMatch[1], 10) * 30;
  }
  
  return 999;
}

export function isRemoteJob(job: any): boolean {
  const loc = normalizeText(job.location);
  const title = normalizeText(job.title);
  const desc = normalizeText(job.description);
  
  const remoteKeywords = ["remote", "anywhere", "wfh", "work from home"];
  
  return remoteKeywords.some(kw => loc.includes(kw) || title.includes(kw) || desc.includes(kw));
}

export function matchesLocation(job: any, locationFilter: string): boolean {
  if (locationFilter === "all" || !locationFilter) return true;
  
  const loc = normalizeText(job.location);
  const filter = normalizeText(locationFilter);
  
  if (filter === "unknown") {
    return loc === "" || loc === "unknown" || loc === "undefined" || loc === "null";
  }
  
  if (filter === "remote" || filter === "anywhere") {
    return isRemoteJob(job);
  }
  
  if (filter === "indore") {
    return loc.includes("indore") || loc.includes("madhya pradesh") || loc.includes("mp");
  }
  
  return loc.includes(filter);
}

export function matchesPostedDate(job: any, postedFilter: string): boolean {
  if (postedFilter === "all" || postedFilter === "any" || !postedFilter) return true;
  
  const days = parsePostedAtToDays(job.postedDate);
  
  if (postedFilter === "24h") return days === 0;
  if (postedFilter === "2d") return days <= 2;
  if (postedFilter === "7d") return days <= 7;
  if (postedFilter === "unknown") return days === 999;
  
  return true;
}

export function isRelevantJob(job: any): boolean {
  const title = normalizeText(job.title);
  const desc = normalizeText(job.description);
  const combined = title + " " + desc;

  const goodKeywords = ["react", "mern", "frontend", "front end", "front-end", "javascript", "node.js", "nodejs", "node js", "full stack", "full-stack", "fullstack"];
  const badKeywords = [".net", "java spring boot", "php", "android", "ios", "devops", "data engineer", "qa tester", "sap", "salesforce", "wordpress", "shopify"];

  const hasGood = goodKeywords.some(kw => combined.includes(kw));
  const hasBad = badKeywords.some(kw => combined.includes(kw));

  // Hide jobs if title/description mainly contains bad keywords, 
  // but DO NOT hide if it also contains good keywords.
  if (hasBad && !hasGood) {
    return false; 
  }
  return true;
}

export function hasUnknownLocation(job: any): boolean {
  const loc = normalizeText(job.location);
  return !loc || loc === "unknown" || loc === "undefined" || loc === "null";
}

export function hasUnknownPostedDate(job: any): boolean {
  const days = parsePostedAtToDays(job.postedDate);
  return days === 999;
}

export function isIndoreOrRemote(job: any): boolean {
  const loc = normalizeText(job.location);
  if (loc.includes("indore") || loc.includes("mp") || loc.includes("madhya pradesh")) return true;
  return isRemoteJob(job);
}

export function filterJobs(jobs: any[], filters: any): any[] {
  return jobs.filter(job => {
    // 1. Search
    if (filters.search) {
      const s = normalizeText(filters.search);
      const title = normalizeText(job.title);
      const company = normalizeText(job.company);
      const location = normalizeText(job.location);
      if (!title.includes(s) && !company.includes(s) && !location.includes(s)) {
        return false;
      }
    }
    
    // 2. Score
    if (filters.score && filters.score !== "all") {
      const score = job.score || 0;
      if (filters.score === "high" && score < 80) return false;
      if ((filters.score === "mid" || filters.score === "medium") && (score < 50 || score >= 80)) return false;
      if (filters.score === "low" && score >= 50) return false;
      // Note for "Ready to Apply": score >= 50 means mid or high.
      if (filters.score === "mid_high" && score < 50) return false;
    }
    
    // 3. Status
    if (filters.status && filters.status !== "all" && filters.status !== "All") {
      if (job.status !== filters.status) return false;
    }
    
    // 4. Location
    if (filters.location && filters.location !== "all") {
      if (filters.location === "remote_indore") {
         if (!isIndoreOrRemote(job)) return false;
      } else {
         if (!matchesLocation(job, filters.location)) return false;
      }
    }
    
    // 5. Posted Date
    if (filters.posted && filters.posted !== "any") {
      if (!matchesPostedDate(job, filters.posted)) return false;
    }
    
    // 6. Remote
    if (filters.remote && filters.remote !== "all") {
      const isRemote = isRemoteJob(job);
      if (filters.remote === "remote" && !isRemote) return false;
      if (filters.remote === "non-remote" && isRemote) return false;
    }

    // 7. Source
    if (filters.source && filters.source !== "all") {
       const source = normalizeText(job.source);
       if (!source.includes(normalizeText(filters.source))) return false;
    }

    // 8. Relevant Only
    if (filters.relevantOnly === "true" || filters.relevantOnly === true) {
       if (!isRelevantJob(job)) return false;
    }

    // 9. Hide Unknown
    if (filters.hideUnknown === "true" || filters.hideUnknown === true) {
       if (hasUnknownLocation(job) || hasUnknownPostedDate(job)) return false;
    }
    
    return true;
  });
}

export function sortJobs(jobs: any[]): any[] {
  return [...jobs].sort((a, b) => {
    const daysA = parsePostedAtToDays(a.postedDate);
    const daysB = parsePostedAtToDays(b.postedDate);
    
    // 1. Posted date newest first
    if (daysA !== daysB) {
      return daysA - daysB; 
    }
    
    // 2. Score highest first
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    if (scoreA !== scoreB) {
       return scoreB - scoreA;
    }

    // 3. Remote/Indore jobs first
    const aIsPremiumLoc = isIndoreOrRemote(a) ? 1 : 0;
    const bIsPremiumLoc = isIndoreOrRemote(b) ? 1 : 0;
    return bIsPremiumLoc - aIsPremiumLoc;
  });
}
