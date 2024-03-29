import repository.*;

import javax.persistence.EntityManager;

public class MySystemRepository {

    private final Users users;
    private final Teams teams;
    private final Searches searches;
    private final Matches matches;
    private final Contacts contacts;
    private final Notifications notifications;
    private final Messages messages;
    private final TimeIntervals timeIntervals;

    public MySystemRepository(EntityManager entityManager) {
        this.users = new Users(entityManager);
        this.teams=new Teams(entityManager);
        this.searches = new Searches(entityManager);
        this.matches = new Matches(entityManager);
        this.notifications = new Notifications(entityManager);
        this.contacts = new Contacts(entityManager);
        this.messages = new Messages(entityManager);
        this.timeIntervals = new TimeIntervals(entityManager);
    }

    public static MySystemRepository create(EntityManager entityManager) {
        return new MySystemRepository(entityManager);
    }

    public Users users() {
        return users;
    }
    public Teams teams(){
        return teams;
    }

    public Searches searches() {
        return searches;
    }
    public Matches matches() {
        return matches;
    }
    public Contacts contacts(){return contacts;}
    public Notifications notifications() {
        return notifications;
    }
    public Messages messages() {
        return messages;
    }
    public TimeIntervals timeIntervals(){return timeIntervals;}
}
