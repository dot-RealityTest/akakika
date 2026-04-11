const owner = "dot-RealityTest";
const repo = "breakpoint";
const releasesUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;

const primaryLinks = [
  document.getElementById("download-link-nav"),
  document.getElementById("download-link-hero"),
  document.getElementById("download-link-footer"),
].filter(Boolean);

const heroMeta = document.getElementById("release-meta-hero");
const footerMeta = document.getElementById("release-meta-footer");

function setDownloadLinks(url, label) {
  for (const link of primaryLinks) {
    link.href = url;
    link.textContent = label;
  }
}

function setMeta(text) {
  if (heroMeta) heroMeta.textContent = text;
  if (footerMeta) footerMeta.textContent = text;
}

async function loadLatestRelease() {
  try {
    const response = await fetch(releasesUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!response.ok) {
      throw new Error(`GitHub release lookup failed with ${response.status}`);
    }

    const release = await response.json();
    const dmgAsset = (release.assets || []).find((asset) =>
      asset.name.toLowerCase().endsWith(".dmg"),
    );

    const tag = release.tag_name || release.name || "latest";
    const published = release.published_at
      ? new Date(release.published_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "unknown date";

    if (dmgAsset) {
      const sizeMb = Math.round(dmgAsset.size / 1024 / 1024);
      setDownloadLinks(dmgAsset.browser_download_url, `Download ${dmgAsset.name}`);
      setMeta(`Latest release: ${tag} · ${sizeMb} MB DMG · published ${published}`);
    } else {
      setDownloadLinks(release.html_url, "View GitHub Release");
      setMeta(`Latest release: ${tag} · no DMG asset found · published ${published}`);
    }
  } catch (error) {
    console.error(error);
    setDownloadLinks(`https://github.com/${owner}/${repo}/releases`, "View GitHub Releases");
    setMeta("GitHub release metadata is temporarily unavailable. Use the Releases page instead.");
  }
}

loadLatestRelease();
