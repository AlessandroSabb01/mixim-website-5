"""Bundle src/ into one artifact page: motion-studio/review/motion-studio.html"""
import pathlib
src = pathlib.Path(__file__).parent / "src"
shell = (src / "shell.html").read_text()
css = (src / "styles.css").read_text()
js = "\n".join((src / f).read_text() for f in ["core.js", "audio.js", "home.js", "review.js", "create.js", "boot.js"])
out = shell.replace("/*STYLES*/", css).replace("/*SCRIPTS*/", js)
dst = pathlib.Path(__file__).parent / "motion-studio.html"
dst.write_text(out)
print(dst, len(out.encode()) // 1024, "KB")
