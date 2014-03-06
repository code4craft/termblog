package us.codecraft.blog.jsterm;

import java.util.List;

/**
 * @author code4crafter@gmail.com
 */
public class Dir implements File{

    private String type = "dir";

    private String name;

    private List<? extends File> contents;

    public Dir(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<? extends File> getContents() {
        return contents;
    }

    public void setContents(List<? extends File> contents) {
        this.contents = contents;
    }
}