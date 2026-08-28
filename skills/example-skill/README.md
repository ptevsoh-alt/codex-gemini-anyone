# Example Skill

Copy this directory, change the skill_id, description, triggers, input/output contract, and SKILL.md, then run:

~~~text
npm run skills:list
~~~

Skills are discovered from their manifest. A Skill does not call another Skill directly; the runtime resolves a route and the caller may create a follow-up task using the handoff output.

