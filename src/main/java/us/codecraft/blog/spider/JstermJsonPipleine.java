package us.codecraft.blog.spider;

import com.google.common.collect.ArrayListMultimap;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.time.DateFormatUtils;
import us.codecraft.blog.jsterm.Dir;
import us.codecraft.blog.jsterm.File;
import us.codecraft.blog.jsterm.Text;
import us.codecraft.webmagic.Task;
import us.codecraft.webmagic.pipeline.PageModelPipeline;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @author code4crafter@gmail.com
 */
public class JstermJsonPipleine implements PageModelPipeline<OschinaBlog> {

    private ArrayListMultimap<String, OschinaBlog> blogCategoryMap = ArrayListMultimap.create();

    private String filePath;

    public JstermJsonPipleine(String filePath) {
        this.filePath = filePath;
    }

    @Override
    public void process(OschinaBlog oschinaBlog, Task task) {
        blogCategoryMap.put(oschinaBlog.getCategory(), oschinaBlog);
    }

    public void flush() {
        Dir root = new Dir("blog");
        List<File> blogCategoryDirs = new ArrayList<File>();
        root.setContents(blogCategoryDirs);
        for (String key : blogCategoryMap.keySet()) {
            Dir categoryDir = new Dir(key);
            blogCategoryDirs.add(categoryDir);
            List<OschinaBlog> oschinaBlogList = blogCategoryMap.get(key);
            List<Text> blogList = new ArrayList<Text>();
            Collections.sort(oschinaBlogList);
            categoryDir.setContents(blogList);
            java.io.File file = new java.io.File(filePath + java.io.File.separator + key);
            file.mkdir();
            for (OschinaBlog oschinaBlog : oschinaBlogList) {
                Text blog = new Text(oschinaBlog.getTitle());
                blog.setContents("<h2>" + oschinaBlog.getTitle() + "</h2>" + oschinaBlog.getContent());
                blog.setDescription(DateFormatUtils.format(oschinaBlog.getDate(), "yyyy-MM-dd HH:mm"));
                blogList.add(blog);
                file = new java.io.File(filePath + java.io.File.separator + key+ java.io.File.separator+oschinaBlog.getTitle().replace("/","&"));
                try {
                    IOUtils.write("<h2>" + oschinaBlog.getTitle() + "</h2>"+oschinaBlog.getContent(),new FileWriter(file));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
