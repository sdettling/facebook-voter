class ChangeFbidTypes < ActiveRecord::Migration
  def up
    change_column :users, :fbid, :string
    change_column :votes, :voter, :string
  end

  def down
    change_column :users, :fbid, :integer
    change_column :votes, :voter, :integer
  end
end
